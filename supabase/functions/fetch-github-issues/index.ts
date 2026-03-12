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

    const { workspaceId, projectId } = await req.json();
    
    console.log('Fetching GitHub issues for project/workspace:', projectId || workspaceId);

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      throw new Error('GitHub token not configured');
    }

    // Resolve integration config from unified integrations table
    const githubConfig = await resolveIntegrationConfig(supabaseClient, 'github', { projectId, workspaceId });

    if (!githubConfig) {
      throw new Error('GitHub not configured for this project');
    }

    const repoUrl = githubConfig.config?.repo_url;
    const repoName = githubConfig.config?.repo_name;

    // Extract owner and repo
    let owner = '';
    let repo = '';
    
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        owner = match[1];
        repo = match[2].replace('.git', '');
      }
    } else if (repoName) {
      const parts = repoName.split('/');
      if (parts.length === 2) {
        owner = parts[0];
        repo = parts[1];
      }
    }

    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository configuration');
    }

    // Fetch issues from GitHub
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`;
    
    const githubResponse = await fetch(githubApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Lovable-App',
      },
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error('GitHub API error:', errorText);
      throw new Error(`Failed to fetch GitHub issues: ${githubResponse.status}`);
    }

    const issues = await githubResponse.json();
    
    const formattedIssues = issues
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        id: issue.number,
        title: issue.title,
        description: issue.body || '',
        status: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        assignee: issue.assignee?.login || null,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      }));

    console.log(`Successfully fetched ${formattedIssues.length} GitHub issues`);

    return new Response(
      JSON.stringify({
        success: true,
        issues: formattedIssues,
        totalCount: formattedIssues.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-github-issues function:', error);
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
