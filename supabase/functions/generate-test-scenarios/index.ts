import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const inputSchema = z.object({
  projectId: z.string().uuid(),
  backlogItemId: z.string().uuid().optional(),
  userStory: z.string().min(10).max(5000),
  acceptanceCriteria: z.string().max(5000).optional(),
});

const rateLimiter = new Map<string, { count: number; resetAt: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized: Missing authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized: Invalid token');

    // Rate limit: 10 per minute
    const now = Date.now();
    const userLimit = rateLimiter.get(user.id);
    if (!userLimit || now > userLimit.resetAt) {
      rateLimiter.set(user.id, { count: 1, resetAt: now + 60000 });
    } else if (userLimit.count >= 10) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((userLimit.resetAt - now) / 1000)} seconds`);
    } else {
      userLimit.count++;
    }

    const rawInput = await req.json();
    const { projectId, backlogItemId, userStory, acceptanceCriteria } = inputSchema.parse(rawInput);

    // Verify project membership
    const { data: project, error: projectError } = await supabase
      .from('pmi_projects')
      .select('id, name')
      .eq('id', projectId)
      .single();
    if (projectError || !project) throw new Error('Project not found or access denied');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    console.log('Generating test scenarios for project:', projectId);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        tools: [{
          type: 'function',
          function: {
            name: 'return_test_scenarios',
            description: 'Return structured test scenarios for the given user story.',
            parameters: {
              type: 'object',
              properties: {
                scenarios: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      type: { type: 'string', enum: ['happy_path', 'edge_case', 'negative', 'performance', 'security', 'accessibility'] },
                      priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                      steps: { type: 'array', items: { type: 'string' } },
                      expected_result: { type: 'string' },
                      preconditions: { type: 'string' },
                    },
                    required: ['title', 'description', 'type', 'priority', 'steps', 'expected_result'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['scenarios'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'return_test_scenarios' } },
        messages: [
          {
            role: 'system',
            content: 'You are a QA engineer generating comprehensive acceptance test scenarios. Cover happy paths, edge cases, negative tests, and non-functional requirements. Be specific and actionable. Do NOT include any PII or real user data in test scenarios.',
          },
          {
            role: 'user',
            content: `Generate acceptance test scenarios for this user story:\n\n**User Story:**\n${userStory}\n\n${acceptanceCriteria ? `**Acceptance Criteria:**\n${acceptanceCriteria}` : ''}\n\nGenerate 5-8 test scenarios covering happy paths, edge cases, negative tests, and at least one security or accessibility test.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('AI rate limit exceeded. Please try again shortly.');
      if (response.status === 402) throw new Error('AI credits exhausted. Please add funds.');
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let scenarios = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      scenarios = parsed.scenarios || [];
    }

    // Store in database
    const { data: saved, error: saveError } = await supabase
      .from('ai_test_scenarios')
      .insert({
        project_id: projectId,
        backlog_item_id: backlogItemId || null,
        user_story: userStory,
        acceptance_criteria: acceptanceCriteria || null,
        generated_scenarios: scenarios,
        scenario_count: scenarios.length,
        generated_by: user.id,
      })
      .select('id')
      .single();

    if (saveError) console.error('Failed to save scenarios:', saveError);

    // Log AI usage
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'generate-test-scenarios',
      model: 'google/gemini-2.5-flash',
      tokens_used: 0,
      status: 'success',
      project_id: projectId,
    });

    return new Response(
      JSON.stringify({ scenarios, scenarioId: saved?.id, count: scenarios.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-test-scenarios:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
