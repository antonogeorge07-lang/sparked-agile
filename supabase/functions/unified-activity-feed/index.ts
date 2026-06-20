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
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { projectId: inputProjectId, workspaceId, limit = 30 } = await req.json();
    const projectId = inputProjectId || (workspaceId ? await resolveProjectId(supabaseClient, workspaceId) : null);

    const activities: any[] = [];
    const errors: string[] = [];

    // 1. Fetch recent Jira activity
    if (projectId) {
      const jiraConfig = await resolveIntegrationConfig(supabaseClient, 'jira', { projectId });
      const boardUrl = jiraConfig?.config?.board_url;
      const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');

      if (boardUrl && jiraApiToken) {
        try {
          const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
          if (urlMatch) {
            const jiraSiteUrl = urlMatch[1];
            const jql = `updated >= -7d ORDER BY updated DESC`;
            const jiraUrl = `${jiraSiteUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=15&fields=key,summary,status,assignee,updated,issuetype,priority`;
            
            const res = await fetch(jiraUrl, {
              headers: {
                'Authorization': `Bearer ${jiraApiToken}`,
                'Accept': 'application/json',
              },
            });

            if (res.ok) {
              const data = await res.json();
              for (const issue of (data.issues || [])) {
                activities.push({
                  id: `jira-${issue.key}`,
                  source: 'jira',
                  type: 'ticket_updated',
                  title: `${issue.key}: ${issue.fields.summary}`,
                  description: `Status: ${issue.fields.status?.name || 'Unknown'}`,
                  author: issue.fields.assignee?.displayName || 'Unassigned',
                  timestamp: issue.fields.updated,
                  url: `${jiraSiteUrl}/browse/${issue.key}`,
                  metadata: {
                    issueType: issue.fields.issuetype?.name,
                    priority: issue.fields.priority?.name,
                    status: issue.fields.status?.name,
                  },
                });
              }
            }
          }
        } catch (e) {
          errors.push(`Jira: ${e instanceof Error ? e.message : 'fetch failed'}`);
        }
      }
    }

    // 2. Fetch recent GitHub activity (commits + PRs)
    if (projectId) {
      const githubConfig = await resolveIntegrationConfig(supabaseClient, 'github', { projectId });
      const repoName = githubConfig?.config?.repo_name;
      const githubToken = Deno.env.get('GITHUB_TOKEN');

      if (repoName && githubToken) {
        try {
          // Recent commits
          const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const commitsRes = await fetch(
            `https://api.github.com/repos/${repoName}/commits?since=${since}&per_page=10`,
            {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Spark-Agile',
              },
            }
          );

          if (commitsRes.ok) {
            const commits = await commitsRes.json();
            for (const commit of commits) {
              activities.push({
                id: `gh-commit-${commit.sha.substring(0, 7)}`,
                source: 'github',
                type: 'commit',
                title: commit.commit.message.split('\n')[0],
                description: `Commit ${commit.sha.substring(0, 7)} to ${repoName}`,
                author: commit.commit.author?.name || 'Unknown',
                timestamp: commit.commit.author?.date,
                url: commit.html_url,
                metadata: { sha: commit.sha.substring(0, 7) },
              });
            }
          }

          // Recent PRs
          const prsRes = await fetch(
            `https://api.github.com/repos/${repoName}/pulls?state=all&sort=updated&direction=desc&per_page=10`,
            {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Spark-Agile',
              },
            }
          );

          if (prsRes.ok) {
            const prs = await prsRes.json();
            for (const pr of prs) {
              activities.push({
                id: `gh-pr-${pr.number}`,
                source: 'github',
                type: pr.merged_at ? 'pr_merged' : pr.state === 'closed' ? 'pr_closed' : 'pr_open',
                title: `PR #${pr.number}: ${pr.title}`,
                description: `${pr.head?.ref} → ${pr.base?.ref}`,
                author: pr.user?.login || 'Unknown',
                timestamp: pr.updated_at,
                url: pr.html_url,
                metadata: {
                  state: pr.state,
                  draft: pr.draft,
                  merged: !!pr.merged_at,
                },
              });
            }
          }
        } catch (e) {
          errors.push(`GitHub: ${e instanceof Error ? e.message : 'fetch failed'}`);
        }
      }
    }

    // 3. Fetch recent Slack messages (from connected channels)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SLACK_API_KEY = Deno.env.get('SLACK_API_KEY');

    if (LOVABLE_API_KEY && SLACK_API_KEY) {
      try {
        const GATEWAY_URL = 'https://connector-gateway.lovable.dev/slack/api';
        // Get channels and recent messages from first few
        const channelsRes = await fetch(`${GATEWAY_URL}/conversations.list?types=public_channel&limit=5&exclude_archived=true`, {
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': SLACK_API_KEY,
          },
        });

        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          const channels = (channelsData.channels || []).slice(0, 3);

          for (const ch of channels) {
            const histRes = await fetch(`${GATEWAY_URL}/conversations.history?channel=${ch.id}&limit=5`, {
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'X-Connection-Api-Key': SLACK_API_KEY,
              },
            });
            if (histRes.ok) {
              const histData = await histRes.json();
              for (const msg of (histData.messages || [])) {
                activities.push({
                  id: `slack-${ch.id}-${msg.ts}`,
                  source: 'slack',
                  type: 'message',
                  title: (msg.text || '').substring(0, 120),
                  description: `#${ch.name}`,
                  author: msg.user || 'Unknown',
                  timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
                  url: null,
                  metadata: { channel: ch.name, channelId: ch.id },
                });
              }
            }
          }
        }
      } catch (e) {
        errors.push(`Slack: ${e instanceof Error ? e.message : 'fetch failed'}`);
      }
    }

    // Sort all activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(
      JSON.stringify({
        activities: activities.slice(0, limit),
        totalCount: activities.length,
        errors: errors.length > 0 ? errors : undefined,
        sources: {
          jira: activities.some(a => a.source === 'jira'),
          github: activities.some(a => a.source === 'github'),
          slack: activities.some(a => a.source === 'slack'),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Unified activity feed error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
