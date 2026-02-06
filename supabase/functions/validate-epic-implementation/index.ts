import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { epicId } = await req.json();
    if (!epicId) {
      return new Response(JSON.stringify({ error: 'Missing epicId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(epicId)) {
      return new Response(JSON.stringify({ error: 'Invalid epic ID format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Validating epic implementation:', epicId, 'by user:', user.id);

    // Fetch epic data with related information
    const { data: epic, error: epicError } = await supabaseClient
      .from('epics')
      .select(`
        *,
        value_streams(id, name, description)
      `)
      .eq('id', epicId)
      .single();

    if (epicError || !epic) {
      return new Response(JSON.stringify({ error: 'Epic not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch features for this epic
    const { data: features, error: featuresError } = await supabaseClient
      .from('features')
      .select('*')
      .eq('epic_id', epicId)
      .order('display_order', { ascending: true });

    if (featuresError) {
      console.error('Error fetching features:', featuresError);
      throw new Error('Failed to fetch features');
    }

    // Fetch dependencies
    const { data: dependencies, error: depsError } = await supabaseClient
      .from('epic_dependencies')
      .select(`
        *,
        depends_on:depends_on_epic_id(id, title, status)
      `)
      .eq('epic_id', epicId);

    if (depsError) {
      console.error('Error fetching dependencies:', depsError);
    }

    // Fetch milestones
    const { data: milestones, error: milestonesError } = await supabaseClient
      .from('epic_milestones')
      .select('*')
      .eq('epic_id', epicId)
      .order('target_date', { ascending: true });

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
    }

    // Build the context payload for AI analysis
    const epicContext = {
      epic: {
        title: epic.title,
        description: epic.description,
        status: epic.status,
        priority: epic.priority,
        business_value: epic.business_value,
        business_justification: epic.business_justification,
        strategic_goals: epic.strategic_goals,
        acceptance_criteria: epic.acceptance_criteria,
        start_date: epic.start_date,
        end_date: epic.end_date,
        effort_estimate: epic.effort_estimate,
        health_score: epic.health_score,
        roi_score: epic.roi_score,
        value_stream: epic.value_streams?.name,
      },
      features: (features || []).map(f => ({
        title: f.title,
        description: f.description,
        status: f.status,
        priority: f.priority,
        effort_estimate: f.effort_estimate,
      })),
      dependencies: (dependencies || []).map(d => ({
        type: d.dependency_type,
        status: d.status,
        depends_on_title: d.depends_on?.title,
        depends_on_status: d.depends_on?.status,
        notes: d.notes,
      })),
      milestones: (milestones || []).map(m => ({
        title: m.title,
        status: m.status,
        target_date: m.target_date,
        completion_date: m.completion_date,
        completion_percentage: m.completion_percentage,
      })),
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are the Lovable LLM — an intelligent Agile validation companion integrated within Spark Agile.
Your role is to ensure every Epic, Feature, or Story that is marked as "Yet to Implement" truly deserves to be implemented.

You must analyze the provided epic data, goals, dependencies, and current feature items.

For each feature/item, determine:
- ✅ IMPLEMENT — if implementation is necessary and aligned to the Epic's strategic intent.
- ⚠️ REVIEW — if it is partially redundant, already covered by another deliverable, or conflicting with dependencies.
- ❌ DO NOT IMPLEMENT — if it should not be implemented, due to duplication, lack of business value, or outdated context.

You MUST respond with valid JSON using this exact schema:
{
  "epicSummary": "Brief recap of the epic's strategic intent",
  "validationItems": [
    {
      "item": "Feature/item name",
      "status": "Current status",
      "decision": "implement" | "review" | "do_not_implement",
      "reasoning": "Why this decision was made",
      "recommendation": "Actionable next step"
    }
  ],
  "deliveryAlignmentCheck": "Assessment of whether remaining items align with original goals, OKRs, and DoD criteria",
  "verdict": {
    "alignment": "aligned" | "misaligned" | "requires_review",
    "summary": "Concise judgment statement"
  },
  "nextSteps": [
    "Clear actionable step 1",
    "Clear actionable step 2"
  ],
  "effortAnalysis": {
    "totalEstimatedPoints": number or null,
    "implementPoints": number or null,
    "reviewPoints": number or null,
    "removePoints": number or null,
    "potentialSavings": "Description of effort savings"
  }
}

Be specific, data-driven, and actionable in your analysis. Reference actual feature names and statuses from the data provided.`;

    const userPrompt = `Analyse the following Epic data from the Spark Agile workspace and validate each feature's implementation status:

${JSON.stringify(epicContext, null, 2)}

Provide your implementation validation analysis as JSON.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI processing failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('AI validation response received');

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({
        success: true,
        validation: parsedResult,
        metadata: {
          epicId,
          featuresAnalysed: features?.length || 0,
          dependenciesChecked: dependencies?.length || 0,
          validatedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Epic validation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
