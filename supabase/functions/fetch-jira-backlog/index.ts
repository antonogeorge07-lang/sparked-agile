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

    const { workspaceId, maxResults = 20 } = await req.json();
    
    console.log('Fetching JIRA backlog for workspace:', workspaceId);

    // First try to get user's personal Jira token
    const { data: userToken } = await supabaseClient
      .from('user_jira_tokens')
      .select('jira_token, jira_email, jira_site_url')
      .eq('user_id', user.id)
      .maybeSingle();

    let jiraToken: string | null = null;
    let jiraEmail: string | null = null;
    let jiraSiteUrl: string | null = null;

    if (userToken) {
      // Use user's personal token
      jiraToken = userToken.jira_token;
      jiraEmail = userToken.jira_email;
      jiraSiteUrl = userToken.jira_site_url;
      console.log('Using user personal Jira token');
    } else {
      // Fall back to system token
      jiraToken = Deno.env.get('JIRA_API_TOKEN') ?? null;
      console.log('Using system Jira token');
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

    // Get workspace details for board info
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from('project_workspaces')
      .select('jira_board_id, jira_board_url')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.jira_board_id || !workspace.jira_board_url) {
      return new Response(
        JSON.stringify({
          error: 'JIRA board not connected to this workspace',
          backlogItems: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Extract JIRA site URL from board URL if not using user token
    if (!jiraSiteUrl) {
      const urlMatch = workspace.jira_board_url.match(/(https:\/\/[^\/]+)/);
      if (!urlMatch) {
        throw new Error('Invalid JIRA board URL');
      }
      jiraSiteUrl = urlMatch[1];
    }

    // Prepare authorization header
    let authHeader: string;
    if (jiraEmail) {
      // User token uses Basic auth with email:token
      authHeader = `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`;
    } else {
      // System token uses Bearer auth
      authHeader = `Bearer ${jiraToken}`;
    }

    // Fetch backlog issues for the board
    const jiraUrl = `${jiraSiteUrl}/rest/agile/1.0/board/${workspace.jira_board_id}/backlog?maxResults=${maxResults}`;
    
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
    
    // Transform JIRA issues to simplified format
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