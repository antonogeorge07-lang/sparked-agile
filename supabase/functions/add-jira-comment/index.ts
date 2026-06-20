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

    const { projectId, issueKey, comment } = await req.json();
    if (!projectId || !issueKey || !comment) throw new Error('projectId, issueKey, and comment are required');

    // Get user's Jira token
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
            'X-Caller-Function': 'add-jira-comment',
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
      const jiraConfig = await resolveIntegrationConfig(supabaseClient, 'jira', { projectId });
      const boardUrl = jiraConfig?.config?.board_url;
      if (!boardUrl) throw new Error('JIRA not configured for this project');
      const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
      if (!urlMatch) throw new Error('Invalid JIRA board URL');
      jiraSiteUrl = urlMatch[1];
    }

    const authHeader = jiraEmail
      ? `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`
      : `Bearer ${jiraToken}`;

    const jiraResponse = await fetch(`${jiraSiteUrl}/rest/api/2/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: comment }),
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('JIRA API error:', errorText);
      throw new Error(`Failed to add comment: ${jiraResponse.status}`);
    }

    const created = await jiraResponse.json();
    console.log('Successfully added comment to', issueKey);

    return new Response(
      JSON.stringify({ success: true, commentId: created.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in add-jira-comment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
