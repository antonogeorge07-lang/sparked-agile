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

    const { projectId, summary, description, issueType, priority, assignee } = await req.json();
    if (!projectId || !summary) throw new Error('projectId and summary are required');

    console.log('Creating JIRA issue for project:', projectId);

    // Get user's Jira token first
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
            'X-Caller-Function': 'create-jira-issue',
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

    if (!jiraToken) {
      jiraToken = Deno.env.get('JIRA_API_TOKEN') ?? null;
    }

    if (!jiraToken) {
      return new Response(JSON.stringify({ error: 'Jira not connected', needsToken: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    const jiraConfig = await resolveIntegrationConfig(supabaseClient, 'jira', { projectId });
    const boardUrl = jiraConfig?.config?.board_url;
    const jiraProjectKey = jiraConfig?.config?.project_key;

    if (!boardUrl) throw new Error('JIRA not configured for this project');

    if (!jiraSiteUrl) {
      const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
      if (!urlMatch) throw new Error('Invalid JIRA board URL');
      jiraSiteUrl = urlMatch[1];
    }

    // We need a project key to create issues
    let projectKey = jiraProjectKey;
    if (!projectKey) {
      // Try to extract from board URL or fetch from Jira
      const boardId = jiraConfig?.config?.board_id;
      if (boardId) {
        const authHeader = jiraEmail
          ? `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`
          : `Bearer ${jiraToken}`;
        const boardResp = await fetch(`${jiraSiteUrl}/rest/agile/1.0/board/${boardId}/configuration`, {
          headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
        });
        if (boardResp.ok) {
          const boardConfig = await boardResp.json();
          projectKey = boardConfig.location?.projectKey;
        }
      }
    }

    if (!projectKey) throw new Error('Could not determine Jira project key. Please reconfigure Jira integration.');

    const authHeader = jiraEmail
      ? `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`
      : `Bearer ${jiraToken}`;

    const createPayload: any = {
      fields: {
        project: { key: projectKey },
        summary,
        issuetype: { name: issueType || 'Story' },
      }
    };

    if (description) createPayload.fields.description = description;
    if (priority) createPayload.fields.priority = { name: priority };
    if (assignee) createPayload.fields.assignee = { name: assignee };

    const jiraResponse = await fetch(`${jiraSiteUrl}/rest/api/2/issue`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('JIRA API error:', errorText);
      throw new Error(`Failed to create JIRA issue: ${jiraResponse.status}`);
    }

    const createdIssue = await jiraResponse.json();
    console.log('Successfully created JIRA issue:', createdIssue.key);

    return new Response(
      JSON.stringify({
        success: true,
        issue: {
          key: createdIssue.key,
          id: createdIssue.id,
          url: `${jiraSiteUrl}/browse/${createdIssue.key}`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-jira-issue:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
