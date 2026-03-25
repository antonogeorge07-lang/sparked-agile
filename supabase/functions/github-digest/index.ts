import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GitHubEvent {
  type: 'commit' | 'pr' | 'issue';
  author: string;
  summary: string;
  link: string;
  status: string;
  timestamp: string;
}

interface DigestSummary {
  done: string;
  blocked: string;
  focus: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Parse request
    const { repoUrl, projectId, workspaceId } = await req.json();
    console.log('GitHub Digest request:', { repoUrl, projectId, workspaceId });

    // Get GitHub token (user's or system)
    const { data: userToken } = await supabase
      .from('user_github_tokens')
      .select('github_token')
      .eq('user_id', user.id)
      .single();
    
    const githubToken = userToken?.github_token || Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return new Response(
        JSON.stringify({ error: 'No GitHub token configured', needsToken: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Resolve repo name
    let repoName = '';
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (match) {
        repoName = `${match[1]}/${match[2].replace('.git', '')}`;
      }
    } else if (workspaceId) {
      const { data: workspace } = await supabase
        .from('project_workspaces')
        .select('github_repo_url')
        .eq('id', workspaceId)
        .single();
      if (workspace?.github_repo_url) {
        const match = workspace.github_repo_url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
        if (match) {
          repoName = `${match[1]}/${match[2].replace('.git', '')}`;
        }
      }
    } else if (projectId) {
      const { data: integration } = await supabase
        .from('integrations')
        .select('config')
        .eq('project_id', projectId)
        .eq('integration_type', 'github')
        .eq('is_active', true)
        .single();
      if (integration?.config) {
        const config = integration.config as { owner?: string; repository?: string };
        if (config.owner && config.repository) {
          repoName = `${config.owner}/${config.repository}`;
        }
      }
    }

    if (!repoName) {
      return new Response(
        JSON.stringify({ 
          error: 'No GitHub repository configured',
          summary: null,
          raw_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Fetching 24h activity for repo: ${repoName}`);

    // Calculate 24h ago timestamp
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events: GitHubEvent[] = [];
    const headers = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SM-ActiveIntelligence-Digest',
    };

    // Fetch commits from last 24h
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${repoName}/commits?since=${since}&per_page=50`,
      { headers }
    );
    if (commitsResponse.ok) {
      const commits = await commitsResponse.json();
      for (const commit of commits) {
        events.push({
          type: 'commit',
          author: commit.commit?.author?.name || commit.author?.login || 'Unknown',
          summary: commit.commit?.message?.split('\n')[0] || 'No message',
          link: commit.html_url,
          status: 'completed',
          timestamp: commit.commit?.author?.date || new Date().toISOString(),
        });
      }
    }

    // Fetch PRs (open + recently updated)
    const prsResponse = await fetch(
      `https://api.github.com/repos/${repoName}/pulls?state=all&sort=updated&direction=desc&per_page=20`,
      { headers }
    );
    if (prsResponse.ok) {
      const prs = await prsResponse.json();
      for (const pr of prs) {
        const updatedAt = new Date(pr.updated_at);
        if (updatedAt >= new Date(since)) {
          events.push({
            type: 'pr',
            author: pr.user?.login || 'Unknown',
            summary: pr.title,
            link: pr.html_url,
            status: pr.merged_at ? 'merged' : pr.state === 'closed' ? 'closed' : pr.draft ? 'draft' : 'open',
            timestamp: pr.updated_at,
          });
        }
      }
    }

    // Fetch issues (open + recently updated)
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${repoName}/issues?state=all&sort=updated&direction=desc&per_page=20`,
      { headers }
    );
    if (issuesResponse.ok) {
      const issues = await issuesResponse.json();
      for (const issue of issues) {
        // Skip PRs (they appear in issues endpoint too)
        if (issue.pull_request) continue;
        const updatedAt = new Date(issue.updated_at);
        if (updatedAt >= new Date(since)) {
          events.push({
            type: 'issue',
            author: issue.user?.login || 'Unknown',
            summary: issue.title,
            link: issue.html_url,
            status: issue.state,
            timestamp: issue.updated_at,
          });
        }
      }
    }

    console.log(`Collected ${events.length} events in last 24h`);

    // If no events, return empty digest
    if (events.length === 0) {
      return new Response(
        JSON.stringify({
          repo: repoName,
          date: new Date().toISOString().split('T')[0],
          summary: {
            done: 'No activity recorded in the last 24 hours.',
            blocked: 'No blockers identified.',
            focus: 'Check in with the team for updates.',
          },
          raw_count: 0,
          processing_time_ms: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Limit events for token efficiency
    const limitedEvents = events.slice(0, 50);

    // Build activity text for AI
    const activityText = limitedEvents.map(e => 
      `[${e.type.toUpperCase()}] ${e.author}: ${e.summary} (${e.status})`
    ).join('\n');

    // Call Lovable AI for summarization
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiPrompt = `Summarize the following GitHub activity from the last 24 hours into three concise sections.

Activity Log:
${activityText}

Provide exactly three sections:
1. ✅ What was completed (merged PRs, closed issues, significant commits)
2. ⚠️ What's pending or blocked (open PRs awaiting review, open issues, draft PRs)
3. 🎯 What to focus on next (prioritized action items based on the activity)

Keep each section to 2-4 bullet points max. Be specific about task names and authors.`;

    console.log('Calling Lovable AI for summarization...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a concise technical project manager. Generate clear, actionable summaries from GitHub activity. Focus on outcomes and next steps.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const fullSummary = aiData.choices?.[0]?.message?.content || '';

    // Parse the AI response into structured sections
    const summary: DigestSummary = {
      done: '',
      blocked: '',
      focus: '',
    };

    // Extract sections from AI response
    const doneMatch = fullSummary.match(/✅[^⚠️🎯]*/s);
    const blockedMatch = fullSummary.match(/⚠️[^🎯]*/s);
    const focusMatch = fullSummary.match(/🎯.*/s);

    summary.done = doneMatch ? doneMatch[0].replace(/^✅\s*(What was completed|Completed)?:?\s*/i, '').trim() : 'No completed items identified.';
    summary.blocked = blockedMatch ? blockedMatch[0].replace(/^⚠️\s*(What's pending or blocked|Pending\/Blocked)?:?\s*/i, '').trim() : 'No blockers identified.';
    summary.focus = focusMatch ? focusMatch[0].replace(/^🎯\s*(What to focus on next|Focus)?:?\s*/i, '').trim() : 'Review the activity and prioritize as needed.';

    const processingTime = Date.now() - startTime;
    console.log(`Digest generated in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        repo: repoName,
        date: new Date().toISOString().split('T')[0],
        summary,
        raw_count: events.length,
        processing_time_ms: processingTime,
        events_sample: limitedEvents.slice(0, 5), // Include sample for debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in github-digest:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
