import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Input validation
    const { updates, projectId, includeActionItems } = await req.json();
    
    if (!updates || !Array.isArray(updates)) {
      throw new Error('Invalid input: updates must be an array');
    }

    if (updates.length === 0) {
      throw new Error('No updates provided');
    }

    if (updates.length > 100) {
      throw new Error('Too many updates (max 100)');
    }

    // Validate each update object structure and fields
    for (const update of updates) {
      if (!update.name || typeof update.name !== 'string' || update.name.length > 100) {
        throw new Error('Invalid update: name must be a string (max 100 chars)');
      }
      if (!update.yesterday || typeof update.yesterday !== 'string' || update.yesterday.length > 1000) {
        throw new Error('Invalid update: yesterday must be a string (max 1000 chars)');
      }
      if (!update.today || typeof update.today !== 'string' || update.today.length > 1000) {
        throw new Error('Invalid update: today must be a string (max 1000 chars)');
      }
      if (update.blockers && (typeof update.blockers !== 'string' || update.blockers.length > 1000)) {
        throw new Error('Invalid update: blockers must be a string (max 1000 chars)');
      }
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

    console.log("Generating standup summary for", updates.length, "team members");

    // Create a formatted summary of all updates
    const updatesText = updates.map((update: any) => 
      `${update.name}:\n- Yesterday: ${update.yesterday}\n- Today: ${update.today}\n- Blockers: ${update.blockers || 'None'}`
    ).join('\n\n');

    const systemPrompt = includeActionItems 
      ? "You are a helpful Scrum Master assistant. Generate concise, actionable daily standup summaries AND extract specific action items from blockers. Focus on progress, blockers, next steps, and actionable tasks."
      : "You are a helpful Scrum Master assistant. Generate concise, actionable daily standup summaries. Focus on progress, blockers, and next steps.";

    const userPrompt = includeActionItems
      ? `Generate a professional standup summary from these team updates:\n\n${updatesText}\n\nProvide:\n1. Team progress highlights\n2. Today's focus areas\n3. Blockers requiring attention\n4. Suggested action items\n\nThen, extract specific action items in JSON format with this structure:\n{"actionItems": [{"title": "action description", "priority": "high|medium|low", "assignedTo": "team member name"}]}`
      : `Generate a professional standup summary from these team updates:\n\n${updatesText}\n\nProvide:\n1. Team progress highlights\n2. Today's focus areas\n3. Blockers requiring attention\n4. Suggested action items`;

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
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
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
    const fullContent = data.choices[0].message.content;

    // Extract action items if requested
    let summary: string = fullContent;
    let actionItems: Array<{title: string; priority: string; assignedTo: string}> = [];
    
    if (includeActionItems) {
      // Try to extract JSON from the response
      const jsonMatch = fullContent.match(/\{[\s\S]*"actionItems"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          actionItems = parsed.actionItems || [];
          // Remove JSON from summary
          summary = fullContent.replace(jsonMatch[0], '').trim();
        } catch (e) {
          console.log("Could not parse action items JSON, continuing without them");
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        summary,
        actionItems: includeActionItems ? actionItems : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-standup-summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
