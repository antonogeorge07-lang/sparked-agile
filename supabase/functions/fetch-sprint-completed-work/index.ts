import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveIntegrationConfig, resolveProjectId } from "../_shared/integration-resolver.ts";

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

    const { workspaceId, projectId: inputProjectId, sprintNumber, sprintStartDate, sprintEndDate } = await req.json();
    
    console.log(`Fetching completed work for Sprint ${sprintNumber}`);

    // Resolve project ID
    const projectId = inputProjectId || (workspaceId ? await resolveProjectId(supabaseClient, workspaceId) : null);

    const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');
    const githubToken = Deno.env.get('GITHUB_TOKEN');

    const result: any = {
      success: true,
      completedTickets: [],
      githubCommits: [],
    };

    // Get Jira config from integrations table
    const jiraConfig = projectId ? await resolveIntegrationConfig(supabaseClient, 'jira', { projectId }) : null;
    const boardId = jiraConfig?.config?.board_id;
    const boardUrl = jiraConfig?.config?.board_url;

    // Fetch JIRA completed tickets
    if (boardId && boardUrl && jiraApiToken) {
      try {
        const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
        if (urlMatch) {
          const jiraSiteUrl = urlMatch[1];
          
          const jql = `board = ${boardId} AND status IN (Done, Closed, Resolved) AND resolved >= "${sprintStartDate}" AND resolved <= "${sprintEndDate}"`;
          const jiraUrl = `${jiraSiteUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100&fields=key,summary,description,status,priority,assignee,issuetype,resolutiondate,customfield_10016`;
          
          const jiraResponse = await fetch(jiraUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${jiraApiToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          if (jiraResponse.ok) {
            const jiraData = await jiraResponse.json();
            result.completedTickets = jiraData.issues?.map((issue: any) => ({
              key: issue.key,
              summary: issue.fields.summary,
              description: issue.fields.description,
              status: issue.fields.status?.name,
              priority: issue.fields.priority?.name,
              assignee: issue.fields.assignee?.displayName,
              issueType: issue.fields.issuetype?.name,
              resolvedDate: issue.fields.resolutiondate,
              storyPoints: issue.fields.customfield_10016 || 0,
              url: `${jiraSiteUrl}/browse/${issue.key}`,
            })) || [];
            console.log(`Fetched ${result.completedTickets.length} completed JIRA tickets`);
          }
        }
      } catch (jiraError) {
        console.error('JIRA fetch error:', jiraError);
      }
    }

    // Get GitHub config from integrations table
    const githubConfig = projectId ? await resolveIntegrationConfig(supabaseClient, 'github', { projectId }) : null;
    const repoName = githubConfig?.config?.repo_name;

    // Fetch GitHub commits
    if (repoName && githubToken) {
      try {
        const since = new Date(sprintStartDate).toISOString();
        const until = new Date(sprintEndDate).toISOString();
        const githubUrl = `https://api.github.com/repos/${repoName}/commits?since=${since}&until=${until}&per_page=100`;
        
        const githubResponse = await fetch(githubUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SM-ActiveIntelligence',
          },
        });

        if (githubResponse.ok) {
          const commitsData = await githubResponse.json();
          result.githubCommits = commitsData.map((commit: any) => ({
            sha: commit.sha.substring(0, 7),
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url,
          }));
          console.log(`Fetched ${result.githubCommits.length} GitHub commits`);
        }
      } catch (githubError) {
        console.error('GitHub fetch error:', githubError);
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-sprint-completed-work function:', error);
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
