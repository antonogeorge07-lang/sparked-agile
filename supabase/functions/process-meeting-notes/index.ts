import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const inputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(500),
  meetingType: z.enum(['standup', 'planning', 'retro', 'review', 'general', 'stakeholder']).default('general'),
  rawNotes: z.string().min(20).max(50000),
  attendees: z.array(z.string().max(200)).max(50).optional(),
  meetingDate: z.string().optional(),
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
    const { projectId, title, meetingType, rawNotes, attendees, meetingDate } = inputSchema.parse(rawInput);

    // Verify project membership
    const { data: project } = await supabase
      .from('pmi_projects')
      .select('id')
      .eq('id', projectId)
      .single();
    if (!project) throw new Error('Project not found or access denied');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    console.log('Processing meeting notes for project:', projectId);

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
            name: 'return_meeting_analysis',
            description: 'Return structured analysis of meeting notes.',
            parameters: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'Concise 2-4 sentence summary of the meeting.' },
                decisions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      decision: { type: 'string' },
                      rationale: { type: 'string' },
                      owner: { type: 'string' },
                    },
                    required: ['decision'],
                    additionalProperties: false,
                  },
                },
                action_items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      action: { type: 'string' },
                      assignee: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      due_date_suggestion: { type: 'string' },
                    },
                    required: ['action', 'priority'],
                    additionalProperties: false,
                  },
                },
                key_topics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      topic: { type: 'string' },
                      sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'mixed'] },
                      notes: { type: 'string' },
                    },
                    required: ['topic', 'sentiment'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['summary', 'decisions', 'action_items', 'key_topics'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'return_meeting_analysis' } },
        messages: [
          {
            role: 'system',
            content: `You are a Scrum Master assistant processing ${meetingType} meeting notes. Extract decisions, action items with owners and priorities, and key discussion topics with sentiment. Be specific and actionable. Do NOT include any PII beyond what's already in the notes. Anonymise where possible.`,
          },
          {
            role: 'user',
            content: `Analyse these ${meetingType} meeting notes and extract structured insights:\n\n**Title:** ${title}\n**Notes:**\n${rawNotes}`,
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
    let analysis = { summary: '', decisions: [], action_items: [], key_topics: [] };

    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    }

    // Store in database
    const { data: saved, error: saveError } = await supabase
      .from('meeting_notes')
      .insert({
        project_id: projectId,
        title,
        meeting_type: meetingType,
        raw_notes: rawNotes,
        ai_summary: analysis.summary,
        extracted_decisions: analysis.decisions,
        extracted_action_items: analysis.action_items,
        extracted_key_topics: analysis.key_topics,
        attendees: attendees || [],
        meeting_date: meetingDate || new Date().toISOString(),
        processed_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select('id')
      .single();

    if (saveError) console.error('Failed to save meeting notes:', saveError);

    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'process-meeting-notes',
      model: 'google/gemini-2.5-flash',
      tokens_used: 0,
      status: 'success',
      project_id: projectId,
    });

    return new Response(
      JSON.stringify({
        noteId: saved?.id,
        summary: analysis.summary,
        decisions: analysis.decisions,
        actionItems: analysis.action_items,
        keyTopics: analysis.key_topics,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-meeting-notes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
