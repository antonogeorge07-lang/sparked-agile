import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const inputSchema = z.object({
  projectId: z.string().uuid(),
  sprintsAhead: z.number().int().min(1).max(12).default(3),
  forecastType: z.enum(['capacity', 'allocation', 'burndown', 'staffing']).default('capacity'),
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

    // Rate limit: 5 per minute (heavier computation)
    const now = Date.now();
    const userLimit = rateLimiter.get(user.id);
    if (!userLimit || now > userLimit.resetAt) {
      rateLimiter.set(user.id, { count: 1, resetAt: now + 60000 });
    } else if (userLimit.count >= 5) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((userLimit.resetAt - now) / 1000)} seconds`);
    } else {
      userLimit.count++;
    }

    const rawInput = await req.json();
    const { projectId, sprintsAhead, forecastType } = inputSchema.parse(rawInput);

    // Gather project data for AI context
    const [velocityResult, backlogResult, teamResult, sprintsResult] = await Promise.all([
      supabase.from('sprint_velocity_history')
        .select('sprint_number, committed_points, delivered_points, velocity')
        .eq('project_id', projectId)
        .order('sprint_number', { ascending: false })
        .limit(10),
      supabase.from('native_backlog_items')
        .select('id, title, story_points, priority, status')
        .eq('project_id', projectId)
        .in('status', ['todo', 'in_progress', 'blocked']),
      supabase.from('project_members')
        .select('id, role')
        .eq('project_id', projectId),
      supabase.from('native_sprints')
        .select('id, name, status, start_date, end_date')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const velocityData = velocityResult.data || [];
    const backlogItems = backlogResult.data || [];
    const teamMembers = teamResult.data || [];
    const recentSprints = sprintsResult.data || [];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const totalBacklogPoints = backlogItems.reduce((sum, i) => sum + (i.story_points || 0), 0);
    const avgVelocity = velocityData.length > 0
      ? velocityData.reduce((sum, v) => sum + (v.delivered_points || 0), 0) / velocityData.length
      : 0;

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
            name: 'return_resource_forecast',
            description: 'Return structured resource and capacity forecast.',
            parameters: {
              type: 'object',
              properties: {
                confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
                analysis: { type: 'string' },
                sprint_forecasts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sprint_number: { type: 'number' },
                      predicted_velocity: { type: 'number' },
                      capacity_utilisation: { type: 'number', description: 'Percentage 0-100' },
                      risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                      notes: { type: 'string' },
                    },
                    required: ['sprint_number', 'predicted_velocity', 'capacity_utilisation', 'risk_level'],
                    additionalProperties: false,
                  },
                },
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      recommendation: { type: 'string' },
                      impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                      category: { type: 'string', enum: ['staffing', 'scope', 'process', 'risk'] },
                    },
                    required: ['recommendation', 'impact', 'category'],
                    additionalProperties: false,
                  },
                },
                backlog_completion_estimate: { type: 'string' },
                bottleneck_risks: { type: 'array', items: { type: 'string' } },
              },
              required: ['confidence', 'analysis', 'sprint_forecasts', 'recommendations', 'backlog_completion_estimate'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'return_resource_forecast' } },
        messages: [
          {
            role: 'system',
            content: 'You are a predictive analytics engine for Agile project management. Analyse velocity trends, backlog size, and team capacity to forecast resource needs. Be data-driven and specific. Do NOT include any PII.',
          },
          {
            role: 'user',
            content: `Forecast ${forecastType} for the next ${sprintsAhead} sprints.

**Team Size:** ${teamMembers.length} members
**Average Velocity:** ${avgVelocity.toFixed(1)} points/sprint
**Remaining Backlog:** ${totalBacklogPoints} story points across ${backlogItems.length} items
**Blocked Items:** ${backlogItems.filter(i => i.status === 'blocked').length}

**Velocity History (last ${velocityData.length} sprints):**
${velocityData.map(v => `Sprint ${v.sprint_number}: committed=${v.committed_points}, delivered=${v.delivered_points}`).join('\n')}

**Active Sprints:** ${recentSprints.filter(s => s.status === 'active').length}

Provide ${sprintsAhead} sprint-by-sprint forecasts with capacity utilisation and risk levels.`,
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
    let forecast = { confidence: 'medium', analysis: '', sprint_forecasts: [], recommendations: [], backlog_completion_estimate: '' };

    if (toolCall?.function?.arguments) {
      forecast = JSON.parse(toolCall.function.arguments);
    }

    // Store forecast
    const { data: saved } = await supabase
      .from('resource_forecasts')
      .insert({
        project_id: projectId,
        forecast_type: forecastType,
        forecast_data: { sprint_forecasts: forecast.sprint_forecasts, backlog_completion_estimate: forecast.backlog_completion_estimate, bottleneck_risks: forecast.bottleneck_risks },
        sprints_ahead: sprintsAhead,
        confidence_level: forecast.confidence,
        recommendations: forecast.recommendations,
        ai_analysis: forecast.analysis,
        generated_by: user.id,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'predict-resources',
      model: 'google/gemini-2.5-flash',
      tokens_used: 0,
      status: 'success',
      project_id: projectId,
    });

    return new Response(
      JSON.stringify({ forecastId: saved?.id, ...forecast }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predict-resources:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
