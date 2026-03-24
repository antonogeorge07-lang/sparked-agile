import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { upsertIntegrationConfig, resolveProjectId } from "../_shared/integration-resolver.ts";

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

    const { jiraBoardUrl, jiraSiteUrl, workspaceId, projectId: inputProjectId } = await req.json();
    
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

    // Resolve project ID
    const projectId = inputProjectId || (workspaceId ? await resolveProjectId(supabaseClient, workspaceId) : null);
    
    if (!projectId) {
      throw new Error('Could not determine project ID');
    }

    // Save to unified integrations table
    await upsertIntegrationConfig(supabaseClient, projectId, 'jira', {
      board_url: jiraBoardUrl,
      board_id: boardId,
    }, 'Jira');

    // Also update legacy project_workspaces for backward compatibility
    if (workspaceId) {
      await supabaseClient
        .from('project_workspaces')
        .update({
          jira_board_url: jiraBoardUrl,
          jira_board_id: boardId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workspaceId);
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
