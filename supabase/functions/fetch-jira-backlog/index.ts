import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveIntegrationConfigStrict, isResolveError } from "../_shared/integration-resolver.ts";


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

    const { workspaceId, projectId, maxResults = 20 } = await req.json();
    
    console.log('Fetching JIRA backlog for project/workspace:', projectId || workspaceId);

    // Check if user has Jira token configured via safe view
    const { data: userTokenInfo } = await supabaseClient
      .from('user_jira_tokens_safe')
      .select('has_token, has_jira_email, has_jira_site_url')
      .eq('user_id', user.id)
      .maybeSingle();

    let jiraToken: string | null = null;
    let jiraEmail: string | null = null;
    let jiraSiteUrl: string | null = null;

    if (userTokenInfo?.has_token) {
      console.log('Decrypting user Jira credentials...');
      const decryptResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/decrypt-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
            'X-Caller-Function': 'fetch-jira-backlog',
          },
          body: JSON.stringify({ 
            integrationType: 'jira',
            includeMetadata: true 
          }),
        }
      );

      if (decryptResponse.ok) {
        const decryptedData = await decryptResponse.json();
        jiraToken = decryptedData.token;
        jiraEmail = decryptedData.metadata?.jira_email || null;
        jiraSiteUrl = decryptedData.metadata?.jira_site_url || null;
        console.log('Using user personal Jira token (decrypted)');
      } else {
        console.warn('Failed to decrypt Jira token:', await decryptResponse.text());
      }
    }
    
    if (!jiraToken) {
      jiraToken = Deno.env.get('JIRA_API_TOKEN') ?? null;
      if (jiraToken) {
        console.log('Using system Jira token');
      }
    }

    if (!jiraToken) {
      return new Response(
        JSON.stringify({
          error: 'Jira not connected',
          needsToken: true,
          backlogItems: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Resolve integration config from unified integrations table (strict: verifies user token)
    const jiraResolved = await resolveIntegrationConfigStrict(supabaseClient, 'jira', {
      projectId,
      workspaceId,
      userId: user.id,
    });

    if (isResolveError(jiraResolved)) {
      return new Response(
        JSON.stringify({
          ...jiraResolved,
          backlogItems: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const boardId = jiraResolved.config?.board_id;
    const boardUrl = jiraResolved.config?.board_url;

    if (!boardId || !boardUrl) {
      return new Response(
        JSON.stringify({
          error: 'NOT_CONFIGURED',
          reconnect_required: true,
          integration_type: 'jira',
          message: 'Jira board not connected to this project. Open the Integrations page to finish setup.',
          backlogItems: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }


    // Extract JIRA site URL from board URL if not using user token
    if (!jiraSiteUrl) {
      const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
      if (!urlMatch) {
        throw new Error('Invalid JIRA board URL');
      }
      jiraSiteUrl = urlMatch[1];
    }

    // Prepare authorization header
    let authHeader: string;
    if (jiraEmail) {
      authHeader = `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`;
    } else {
      authHeader = `Bearer ${jiraToken}`;
    }

    // Fetch backlog issues for the board
    const jiraUrl = `${jiraSiteUrl}/rest/agile/1.0/board/${boardId}/backlog?maxResults=${maxResults}`;
    
    const jiraResponse = await fetch(jiraUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('JIRA API error:', errorText);
      throw new Error(`Failed to fetch JIRA backlog: ${jiraResponse.status}`);
    }

    const jiraData = await jiraResponse.json();
    
    const backlogItems = jiraData.issues?.map((issue: any) => ({
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      priority: issue.fields.priority?.name,
      status: issue.fields.status?.name,
      storyPoints: issue.fields.customfield_10016 || issue.fields.storyPoints || 0,
      assignee: issue.fields.assignee?.displayName,
      issueType: issue.fields.issuetype?.name,
      labels: issue.fields.labels,
      url: `${jiraSiteUrl}/browse/${issue.key}`,
    })) || [];

    console.log(`Fetched ${backlogItems.length} backlog items from JIRA`);

    return new Response(
      JSON.stringify({
        success: true,
        backlogItems,
        totalCount: jiraData.total || backlogItems.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-jira-backlog function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, backlogItems: [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
