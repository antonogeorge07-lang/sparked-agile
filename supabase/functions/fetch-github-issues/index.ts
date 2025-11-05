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

    const { workspaceId } = await req.json();
    
    console.log('Fetching GitHub issues for workspace:', workspaceId);

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      throw new Error('GitHub token not configured');
    }

    // Get workspace details
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from('project_workspaces')
      .select('github_repo_url, github_repo_name')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      throw new Error('Workspace not found or GitHub not configured');
    }

    // Extract owner and repo from URL or name
    let owner = '';
    let repo = '';
    
    if (workspace.github_repo_url) {
      const match = workspace.github_repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        owner = match[1];
        repo = match[2].replace('.git', '');
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
    
    // Transform to our format
    const formattedIssues = issues
      .filter((issue: any) => !issue.pull_request) // Exclude PRs
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
