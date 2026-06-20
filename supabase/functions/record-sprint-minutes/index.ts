import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { 
      sessionId,
      meetingNotes,
      finalizedItems,
      updateJira = false,
      jiraBoardId,
      jiraSiteUrl,
    } = await req.json();

    console.log(`Recording minutes for sprint planning session: ${sessionId}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to format and summarize meeting minutes
    const systemPrompt = `You are an expert meeting facilitator and documentation specialist. Your role is to create clear, actionable meeting minutes from sprint planning sessions.`;

    const userPrompt = `Summarize these sprint planning meeting notes into professional meeting minutes:

${meetingNotes}

Items Committed to Sprint:
${finalizedItems.map((item: any) => `- ${item.key}: ${item.summary} (${item.storyPoints} points)`).join('\n')}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Decisions Made
3. Action Items with Owners
4. Sprint Commitments
5. Risks and Dependencies Identified
6. Next Steps

Format the output in a professional, easy-to-read structure.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate meeting minutes');
    }

    const aiData = await aiResponse.json();
    const formattedMinutes = aiData.choices[0].message.content;

    // Update session with meeting minutes
    const { error: updateError } = await supabaseClient
      .from('sprint_planning_sessions')
      .update({
        meeting_minutes: formattedMinutes,
        backlog_items: finalizedItems,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      throw updateError;
    }

    // Optionally update JIRA with sprint assignments
    if (updateJira && jiraBoardId && jiraSiteUrl) {
      const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');
      if (jiraApiToken) {
        try {
          // Update each committed item in JIRA
          for (const item of finalizedItems) {
            if (item.key && item.storyPoints) {
              const jiraUrl = `${jiraSiteUrl}/rest/api/3/issue/${item.key}`;
              await fetch(jiraUrl, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${jiraApiToken}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fields: {
                    customfield_10016: item.storyPoints, // Story points field
                  },
                }),
              });
            }
          }
          console.log(`Updated ${finalizedItems.length} items in JIRA`);
        } catch (jiraError) {
          console.error('Error updating JIRA:', jiraError);
          // Don't fail the entire operation if JIRA update fails
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        formattedMinutes,
        itemsUpdated: finalizedItems.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in record-sprint-minutes function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});