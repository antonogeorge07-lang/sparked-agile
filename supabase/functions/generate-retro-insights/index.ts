import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Rate limiting: check database for recent requests
    const { count: recentCount } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('endpoint', 'generate-retro-insights')
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    if ((recentCount ?? 0) >= 10) {
      throw new Error('Rate limit exceeded. Try again in a minute');
    }

    // Input validation
    const { feedback, projectId } = await req.json();
    
    if (!feedback || !Array.isArray(feedback)) {
      throw new Error('Invalid input: feedback must be an array');
    }

    if (feedback.length === 0) {
      throw new Error('No feedback provided');
    }

    if (feedback.length > 100) {
      throw new Error('Too much feedback (max 100 items)');
    }

    // Verify user has access to project if projectId provided
    if (projectId) {
      const { data: membership, error: memberError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership) {
        throw new Error('Unauthorized: User is not a member of this project');
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating retrospective insights from", feedback.length, "feedback items");

    const feedbackText = feedback.map((item: any, index: number) =>
      `Feedback ${index + 1}:\n- What went well: ${item.wentWell}\n- What could improve: ${item.improve}\n- Action items: ${item.actionItems || 'None suggested'}`
    ).join('\n\n');

    // RAG: Retrieve historical context before generating insights
    let historicalContext = '';
    if (projectId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const { generateEmbedding, vectorToSql } = await import("../_shared/rag-utils.ts");
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

        const queryText = `retrospective feedback themes: ${feedback.map((f: any) => f.improve).join(', ')}`;
        const queryEmbedding = await generateEmbedding(queryText, LOVABLE_API_KEY);

        const { data: ragResults } = await serviceClient.rpc('search_project_knowledge', {
          query_embedding: vectorToSql(queryEmbedding),
          query_text: queryText,
          target_project_id: projectId,
          match_count: 5,
          similarity_threshold: 0.25,
          content_types: ['retro_insight', 'lesson_learned', 'decision'],
        });

        if (ragResults && ragResults.length > 0) {
          historicalContext = `\n\n--- HISTORICAL CONTEXT (from past retrospectives and decisions) ---\n` +
            ragResults.map((r: any) => `[${r.content_type}] ${r.title}: ${r.content}`).join('\n\n') +
            `\n--- END HISTORICAL CONTEXT ---\n\nUse this historical context to identify recurring patterns, track improvement over time, and provide more targeted recommendations.`;
          console.log(`RAG: Injected ${ragResults.length} historical entries`);
        }
      } catch (ragError) {
        console.warn('RAG retrieval failed (non-blocking):', ragError);
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a Scrum Master assistant analyzing retrospective feedback. Identify patterns, themes, and actionable insights to help teams improve. When historical context is provided, reference past patterns and track whether previous issues have been resolved."
          },
          {
            role: "user",
            content: `Analyze this sprint retrospective feedback and provide:\n\n${feedbackText}${historicalContext}\n\n1. Top 3 positive themes (what worked well)\n2. Top 3 areas for improvement\n3. 3-5 specific, actionable recommendations\n4. Overall team health assessment\n5. Recurring patterns (if historical context available)`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    // RAG: Ingest generated insights for future retrieval
    if (projectId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const { generateEmbedding, vectorToSql } = await import("../_shared/rag-utils.ts");
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

        const embedding = await generateEmbedding(
          `Retrospective insights: ${insights.slice(0, 3000)}`,
          LOVABLE_API_KEY
        );

        await serviceClient.from('project_knowledge_base').insert({
          project_id: projectId,
          content_type: 'retro_insight',
          title: `Sprint Retrospective Insights - ${new Date().toISOString().split('T')[0]}`,
          content: insights.slice(0, 10000),
          metadata: { feedback_count: feedback.length, generated_at: new Date().toISOString() },
          embedding: vectorToSql(embedding),
          created_by: user.id,
        });
        console.log('RAG: Ingested retro insights');
      } catch (ingestError) {
        console.warn('RAG ingestion failed (non-blocking):', ingestError);
      }
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-retro-insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
