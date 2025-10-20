import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { jiraBoardUrl, jiraSiteUrl, workspaceId } = await req.json();
    
    console.log('Connecting to JIRA board:', jiraBoardUrl);

    const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');
    if (!jiraApiToken) {
      throw new Error('JIRA API token not configured');
    }

    // Extract board ID from URL
    const boardIdMatch = jiraBoardUrl.match(/board\/(\d+)/);
    const boardId = boardIdMatch ? boardIdMatch[1] : null;

    if (!boardId) {
      throw new Error('Invalid JIRA board URL');
    }

    // Construct JIRA API URL
    const jiraApiUrl = `${jiraSiteUrl}/rest/agile/1.0/board/${boardId}`;
    
    // Test connection by fetching board details
    const jiraResponse = await fetch(jiraApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jiraApiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('JIRA API error:', errorText);
      throw new Error(`Failed to connect to JIRA board: ${jiraResponse.status} - ${errorText}`);
    }

    const boardData = await jiraResponse.json();
    console.log('Successfully connected to JIRA board:', boardData.name);

    // Update workspace with JIRA connection details
    const { error: updateError } = await supabaseClient
      .from('project_workspaces')
      .update({
        jira_board_url: jiraBoardUrl,
        jira_board_id: boardId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspaceId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        boardName: boardData.name,
        boardId: boardId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in connect-jira function:', error);
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