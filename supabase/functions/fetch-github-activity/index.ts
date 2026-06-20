import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { repoUrl, projectId } = await req.json();
    
    console.log('Fetching GitHub activity for:', repoUrl || projectId);

    const { data: userTokenInfo } = await supabaseClient
      .from('user_github_tokens_safe')
      .select('has_token')
      .eq('user_id', user.id)
      .maybeSingle();

    let tokenToUse: string | null = null;
    if (userTokenInfo?.has_token) {
      const decryptResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/decrypt-token`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization')!,
          'Content-Type': 'application/json',
          'X-Caller-Function': 'fetch-github-activity',
        },
        body: JSON.stringify({ integrationType: 'github' }),
      });
      if (decryptResponse.ok) {
        const decrypted = await decryptResponse.json();
        tokenToUse = decrypted.token;
      }
    }

    if (!tokenToUse) tokenToUse = Deno.env.get('GITHUB_TOKEN') ?? null;

    if (!tokenToUse) {
      return new Response(
        JSON.stringify({ 
          error: 'No GitHub token configured',
          needsToken: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get repo URL from integrations if not provided
    let repoName = '';
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (match) {
        repoName = `${match[1]}/${match[2].replace('.git', '')}`;
      }
    } else if (projectId) {
      // Try to get from integrations
      const { data: integration } = await supabaseClient
        .from('integrations')
        .select('config')
        .eq('project_id', projectId)
        .eq('integration_type', 'github')
        .eq('is_active', true)
        .maybeSingle();
      
      if (integration?.config) {
        const config = integration.config as { owner?: string; repository?: string; repo_name?: string; repo_url?: string };
        if (config.owner && config.repository) {
          repoName = `${config.owner}/${config.repository}`;
        } else if (config.repo_name) {
          repoName = config.repo_name;
        } else if (config.repo_url) {
          const match = config.repo_url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
          if (match) repoName = `${match[1]}/${match[2].replace('.git', '')}`;
        }
      }
    }

    if (!repoName) {
      return new Response(
        JSON.stringify({ 
          commits: [],
          pullRequests: [],
          issues: [],
          message: 'No GitHub repository configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Fetch recent commits
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${repoName}/commits?per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SM-ActiveIntelligence',
        },
      }
    );

    let commits = [];
    if (commitsResponse.ok) {
      const commitsData = await commitsResponse.json();
      commits = commitsData.map((commit: any) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));
    }

    // Fetch open pull requests
    const prsResponse = await fetch(
      `https://api.github.com/repos/${repoName}/pulls?state=open&per_page=5`,
      {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SM-ActiveIntelligence',
        },
      }
    );

    let pullRequests = [];
    if (prsResponse.ok) {
      const prsData = await prsResponse.json();
      pullRequests = prsData.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        createdAt: pr.created_at,
        url: pr.html_url,
        draft: pr.draft,
      }));
    }

    // Fetch open issues
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${repoName}/issues?state=open&per_page=5`,
      {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SM-ActiveIntelligence',
        },
      }
    );

    let issues = [];
    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      // Filter out pull requests (they appear in issues endpoint too)
      issues = issuesData
        .filter((issue: any) => !issue.pull_request)
        .map((issue: any) => ({
          number: issue.number,
          title: issue.title,
          author: issue.user.login,
          createdAt: issue.created_at,
          url: issue.html_url,
          labels: issue.labels.map((l: any) => l.name),
        }));
    }

    console.log(`Fetched ${commits.length} commits, ${pullRequests.length} PRs, ${issues.length} issues`);

    return new Response(
      JSON.stringify({
        repoName,
        commits,
        pullRequests,
        issues,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-github-activity function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
