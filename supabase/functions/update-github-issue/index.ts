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

    const { workspaceId, projectId, issueNumber, updates } = await req.json();
    
    console.log('Updating GitHub issue:', issueNumber, 'Updates:', updates);

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

    // Build the update payload
    const updatePayload: any = {};
    
    if (updates.title) {
      updatePayload.title = updates.title;
    }
    if (updates.body !== undefined) {
      updatePayload.body = updates.body;
    }
    if (updates.state) {
      updatePayload.state = updates.state;
    }
    if (updates.assignees) {
      updatePayload.assignees = Array.isArray(updates.assignees) ? updates.assignees : [updates.assignees];
    }
    if (updates.labels) {
      updatePayload.labels = updates.labels;
    }

    // Update issue via GitHub API
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
    
    const githubResponse = await fetch(githubApiUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Lovable-App',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error('GitHub API error:', errorText);
      throw new Error(`Failed to update GitHub issue: ${githubResponse.status}`);
    }

    const updatedIssue = await githubResponse.json();
    console.log('Successfully updated GitHub issue:', issueNumber);

    return new Response(
      JSON.stringify({
        success: true,
        issue: {
          id: updatedIssue.number,
          title: updatedIssue.title,
          description: updatedIssue.body,
          status: updatedIssue.state,
          url: updatedIssue.html_url,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-github-issue function:', error);
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
