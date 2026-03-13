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

    const { projectId, state = 'open' } = await req.json();
    if (!projectId) throw new Error('projectId is required');

    const { data: userToken } = await supabaseClient
      .from('user_github_tokens')
      .select('github_token')
      .eq('user_id', user.id)
      .single();

    const tokenToUse = userToken?.github_token || Deno.env.get('GITHUB_TOKEN');
    if (!tokenToUse) {
      return new Response(JSON.stringify({ error: 'GitHub not connected', needsToken: true, pullRequests: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    const githubConfig = await resolveIntegrationConfig(supabaseClient, 'github', { projectId });
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

    const ghResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=50&sort=updated&direction=desc`,
      {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Spark-Agile',
        },
      }
    );

    if (!ghResponse.ok) {
      throw new Error(`Failed to fetch PRs: ${ghResponse.status}`);
    }

    const prs = await ghResponse.json();
    const formatted = prs.map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      body: pr.body || '',
      state: pr.state,
      draft: pr.draft,
      author: pr.user?.login,
      authorAvatar: pr.user?.avatar_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      url: pr.html_url,
      head: pr.head?.ref,
      base: pr.base?.ref,
      labels: pr.labels?.map((l: any) => l.name) || [],
      reviewers: pr.requested_reviewers?.map((r: any) => r.login) || [],
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
    }));

    return new Response(
      JSON.stringify({ success: true, pullRequests: formatted, totalCount: formatted.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in fetch-github-prs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', pullRequests: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
