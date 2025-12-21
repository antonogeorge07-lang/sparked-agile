import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-event, x-hub-signature-256, x-atlassian-webhook-identifier',
};

// Verify GitHub webhook signature
function verifyGitHubSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  
  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(payload);
    
    // For production, implement HMAC-SHA256 verification
    // This is a simplified check - in production use crypto.subtle
    console.log('GitHub signature verification - signature present');
    return true;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const projectId = url.searchParams.get('project_id');
    const source = url.searchParams.get('source'); // 'github' or 'jira'
    
    console.log(`Received ${source} webhook for project: ${projectId}`);

    const payload = await req.text();
    const data = JSON.parse(payload);

    // Determine event type based on source
    let eventType = 'unknown';
    let integrationData: any = {};

    if (source === 'github') {
      const githubEvent = req.headers.get('x-github-event');
      eventType = githubEvent || 'push';
      
      console.log(`GitHub event type: ${eventType}`);
      
      // Extract relevant data based on event type
      switch (eventType) {
        case 'push':
          integrationData = {
            commits: data.commits?.map((c: any) => ({
              sha: c.id?.substring(0, 7),
              message: c.message?.split('\n')[0],
              author: c.author?.name,
              date: c.timestamp,
              url: c.url,
            })) || [],
            ref: data.ref,
            pusher: data.pusher?.name,
          };
          break;
        case 'pull_request':
          integrationData = {
            action: data.action,
            pullRequest: {
              number: data.pull_request?.number,
              title: data.pull_request?.title,
              author: data.pull_request?.user?.login,
              state: data.pull_request?.state,
              url: data.pull_request?.html_url,
            },
          };
          break;
        case 'issues':
          integrationData = {
            action: data.action,
            issue: {
              number: data.issue?.number,
              title: data.issue?.title,
              author: data.issue?.user?.login,
              state: data.issue?.state,
              url: data.issue?.html_url,
            },
          };
          break;
        default:
          integrationData = { raw: data };
      }
    } else if (source === 'jira') {
      eventType = data.webhookEvent || data.issue_event_type_name || 'jira_update';
      
      console.log(`Jira event type: ${eventType}`);
      
      integrationData = {
        issue: data.issue ? {
          key: data.issue.key,
          summary: data.issue.fields?.summary,
          status: data.issue.fields?.status?.name,
          priority: data.issue.fields?.priority?.name,
          assignee: data.issue.fields?.assignee?.displayName,
        } : null,
        changelog: data.changelog,
        user: data.user?.displayName,
      };
    }

    // Store the event
    if (projectId) {
      const { error: eventError } = await supabaseClient
        .from('integration_events')
        .insert({
          project_id: projectId,
          integration_type: source,
          event_type: eventType,
          payload: integrationData,
        });

      if (eventError) {
        console.error('Error storing event:', eventError);
      } else {
        console.log(`Stored ${source} event: ${eventType}`);
      }

      // Invalidate cache for this integration
      const { error: cacheError } = await supabaseClient
        .from('integration_cache')
        .delete()
        .eq('project_id', projectId)
        .eq('integration_type', source);

      if (cacheError) {
        console.error('Error invalidating cache:', cacheError);
      } else {
        console.log(`Invalidated ${source} cache for project ${projectId}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventType,
        source,
        projectId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
