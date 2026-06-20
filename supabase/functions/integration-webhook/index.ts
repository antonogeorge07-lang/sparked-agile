import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-event, x-hub-signature-256, x-atlassian-webhook-identifier',
};

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Verify GitHub webhook signature using HMAC-SHA256
async function verifyGitHubSignature(payload: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !signature.startsWith('sha256=')) {
    console.log('GitHub signature verification failed: Missing or invalid signature format');
    return false;
  }

  try {
    const expectedSignature = signature.substring(7); // Remove 'sha256=' prefix
    
    // Create HMAC-SHA256 using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Timing-safe comparison
    const isValid = timingSafeEqual(expectedSignature.toLowerCase(), calculatedSignature.toLowerCase());
    
    console.log(`GitHub signature verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    return isValid;
  } catch (error) {
    console.error('GitHub signature verification error:', error);
    return false;
  }
}

// Verify JIRA webhook using HMAC-SHA256 signature verification
async function verifyJiraWebhook(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    console.log('JIRA webhook verification failed: Missing signature header');
    return false;
  }

  try {
    // JIRA sends HMAC-SHA256 signature - verify it
    const expectedSignature = signature.startsWith('sha256=') 
      ? signature.substring(7) 
      : signature;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Timing-safe comparison
    const isValid = timingSafeEqual(expectedSignature.toLowerCase(), calculatedSignature.toLowerCase());

    console.log(`JIRA signature verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    return isValid;
  } catch (error) {
    console.error('JIRA webhook signature verification error:', error);
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

    // Validate required parameters
    if (!projectId || !source) {
      console.log('Webhook rejected: Missing project_id or source');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: project_id and source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.text();

    // Verify webhook signature based on source
    if (source === 'github') {
      const signature = req.headers.get('x-hub-signature-256');
      const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
      
      if (!webhookSecret) {
        console.error('GITHUB_WEBHOOK_SECRET not configured - rejecting webhook');
        return new Response(
          JSON.stringify({ error: 'Webhook secret not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const isValid = await verifyGitHubSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.log('GitHub webhook rejected: Invalid signature');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (source === 'jira') {
      const jiraSignature = req.headers.get('x-hub-signature-256') || req.headers.get('x-atlassian-webhook-identifier');
      const jiraWebhookSecret = Deno.env.get('JIRA_WEBHOOK_SECRET');
      
      if (!jiraWebhookSecret) {
        console.error('JIRA_WEBHOOK_SECRET not configured - rejecting webhook');
        return new Response(
          JSON.stringify({ error: 'Webhook secret not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const isValid = await verifyJiraWebhook(payload, jiraSignature, jiraWebhookSecret);
      if (!isValid) {
        console.log('JIRA webhook rejected: Invalid signature');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log(`Webhook rejected: Unknown source "${source}"`);
      return new Response(
        JSON.stringify({ error: 'Unknown webhook source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
