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

    const { projectId, title, body, labels, assignees } = await req.json();
    if (!projectId || !title) throw new Error('projectId and title are required');

    // Get user's GitHub token first
    const { data: userToken } = await supabaseClient
      .from('user_github_tokens')
      .select('github_token')
      .eq('user_id', user.id)
      .single();

    const tokenToUse = userToken?.github_token || Deno.env.get('GITHUB_TOKEN');
    if (!tokenToUse) {
      return new Response(JSON.stringify({ error: 'GitHub not connected', needsToken: true }), {
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

    const createPayload: any = { title };
    if (body) createPayload.body = body;
    if (labels?.length) createPayload.labels = labels;
    if (assignees?.length) createPayload.assignees = assignees;

    const ghResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenToUse}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Spark-Agile',
      },
      body: JSON.stringify(createPayload),
    });

    if (!ghResponse.ok) {
      const errorText = await ghResponse.text();
      console.error('GitHub API error:', errorText);
      throw new Error(`Failed to create GitHub issue: ${ghResponse.status}`);
    }

    const created = await ghResponse.json();
    console.log('Successfully created GitHub issue:', created.number);

    return new Response(
      JSON.stringify({
        success: true,
        issue: {
          number: created.number,
          title: created.title,
          url: created.html_url,
          state: created.state,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in create-github-issue:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
