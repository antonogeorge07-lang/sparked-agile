import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveIntegrationConfig } from "../_shared/integration-resolver.ts";

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

    const { workspaceId, projectId, issueKey, updates } = await req.json();
    
    console.log('Updating JIRA issue:', issueKey, 'Updates:', updates);

    const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');
    if (!jiraApiToken) {
      throw new Error('JIRA API token not configured');
    }

    // Resolve integration config from unified integrations table
    const jiraConfig = await resolveIntegrationConfig(supabaseClient, 'jira', { projectId, workspaceId });

    const boardUrl = jiraConfig?.config?.board_url;
    if (!boardUrl) {
      throw new Error('JIRA not configured for this project');
    }

    // Extract JIRA site URL
    const urlMatch = boardUrl.match(/(https?:\/\/[^\/]+)/);
    const jiraSiteUrl = urlMatch ? urlMatch[1] : null;

    if (!jiraSiteUrl) {
      throw new Error('Invalid JIRA board URL');
    }

    // Build the update payload
    const updatePayload: any = { fields: {} };
    
    if (updates.summary) {
      updatePayload.fields.summary = updates.summary;
    }
    if (updates.description !== undefined) {
      updatePayload.fields.description = updates.description;
    }
    if (updates.status) {
      updatePayload.transition = { id: updates.status };
    }
    if (updates.assignee) {
      updatePayload.fields.assignee = { name: updates.assignee };
    }

    // Update issue via JIRA API
    const jiraApiUrl = `${jiraSiteUrl}/rest/api/2/issue/${issueKey}`;
    
    const jiraResponse = await fetch(jiraApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jiraApiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('JIRA API error:', errorText);
      throw new Error(`Failed to update JIRA issue: ${jiraResponse.status}`);
    }

    console.log('Successfully updated JIRA issue:', issueKey);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Issue updated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-jira-issue function:', error);
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
