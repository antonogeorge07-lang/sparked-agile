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

    const { workspaceId, projectId } = await req.json();
    console.log('Fetching GitHub issues for project/workspace:', projectId || workspaceId);

    // Try user-specific token first via safe view
    const { data: userTokenInfo } = await supabaseClient
      .from('user_github_tokens_safe')
      .select('has_token')
      .eq('user_id', user.id)
      .maybeSingle();

    let githubToken: string | null = null;

    if (userTokenInfo?.has_token) {
      const decryptResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/decrypt-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
            'X-Caller-Function': 'fetch-github-issues',
          },
          body: JSON.stringify({ integrationType: 'github' }),
        }
      );
      if (decryptResponse.ok) {
        const decryptedData = await decryptResponse.json();
        githubToken = decryptedData.token;
      }
    }

    // Fallback to system token
    if (!githubToken) githubToken = Deno.env.get('GITHUB_TOKEN') ?? null;
    if (!githubToken) {
      return new Response(JSON.stringify({ error: 'GitHub not connected', needsToken: true, issues: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    const githubConfig = await resolveIntegrationConfig(supabaseClient, 'github', { projectId, workspaceId });
    if (!githubConfig) throw new Error('GitHub not configured for this project');

    const repoUrl = githubConfig.config?.repo_url;
    const repoName = githubConfig.config?.repo_name;

    let owner = '', repo = '';
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) { owner = match[1]; repo = match[2].replace('.git', ''); }
    } else if (repoName) {
      const parts = repoName.split('/');
      if (parts.length === 2) { owner = parts[0]; repo = parts[1]; }
    }
    if (!owner || !repo) throw new Error('Invalid GitHub repository configuration');

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Spark-Agile',
        },
      }
    );

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
      JSON.stringify({ success: true, issues: formattedIssues, totalCount: formattedIssues.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in fetch-github-issues function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
