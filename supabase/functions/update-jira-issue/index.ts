import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveIntegrationConfig } from "../_shared/integration-resolver.ts";

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
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { workspaceId, projectId, issueKey, updates } = await req.json();
    console.log('Updating JIRA issue:', issueKey, 'Updates:', updates);

    // Try user-specific token first
    const { data: userTokenInfo } = await supabaseClient
      .from('user_jira_tokens_safe')
      .select('has_token, has_jira_email, has_jira_site_url')
      .eq('user_id', user.id)
      .maybeSingle();

    let jiraToken: string | null = null;
    let jiraEmail: string | null = null;
    let jiraSiteUrl: string | null = null;

    if (userTokenInfo?.has_token) {
      const decryptResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/decrypt-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
            'X-Caller-Function': 'update-jira-issue',
          },
          body: JSON.stringify({ integrationType: 'jira', includeMetadata: true }),
        }
      );
      if (decryptResponse.ok) {
        const decryptedData = await decryptResponse.json();
        jiraToken = decryptedData.token;
        jiraEmail = decryptedData.metadata?.jira_email || null;
        jiraSiteUrl = decryptedData.metadata?.jira_site_url || null;
      }
    }

    if (!jiraToken) jiraToken = Deno.env.get('JIRA_API_TOKEN') ?? null;
    if (!jiraToken) {
      return new Response(JSON.stringify({ error: 'Jira not connected', needsToken: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    if (!jiraSiteUrl) {
      const jiraConfig = await resolveIntegrationConfig(supabaseClient, 'jira', { projectId, workspaceId });
      const boardUrl = jiraConfig?.config?.board_url;
      if (!boardUrl) throw new Error('JIRA not configured for this project');
      const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
      if (!urlMatch) throw new Error('Invalid JIRA board URL');
      jiraSiteUrl = urlMatch[1];
    }

    const authHeader = jiraEmail
      ? `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`
      : `Bearer ${jiraToken}`;

    // Build the update payload
    const updatePayload: any = { fields: {} };
    if (updates.summary) updatePayload.fields.summary = updates.summary;
    if (updates.description !== undefined) updatePayload.fields.description = updates.description;
    if (updates.status) updatePayload.transition = { id: updates.status };
    if (updates.assignee) updatePayload.fields.assignee = { name: updates.assignee };
    if (updates.priority) updatePayload.fields.priority = { name: updates.priority };

    const jiraResponse = await fetch(`${jiraSiteUrl}/rest/api/2/issue/${issueKey}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
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
      JSON.stringify({ success: true, message: 'Issue updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in update-jira-issue function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
