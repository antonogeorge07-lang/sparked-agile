import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { upsertIntegrationConfig, resolveProjectId } from "../_shared/integration-resolver.ts";
import { validateExternalUrl } from "../_shared/url-guard.ts";

async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(key), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, derivedKey, data);
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

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

    const { jiraBoardUrl, jiraSiteUrl, jiraEmail, jiraApiToken: inputJiraApiToken, jiraBoardId, workspaceId, projectId: inputProjectId } = await req.json();

    console.log('Connecting to Jira site:', jiraSiteUrl);

    const jiraApiToken = inputJiraApiToken || Deno.env.get('JIRA_API_TOKEN');
    if (!jiraApiToken) {
      throw new Error('Jira API token is required.');
    }

    const siteUrlGuard = validateExternalUrl(jiraSiteUrl);
    if (!siteUrlGuard.ok) {
      throw new Error('Invalid Jira site URL');
    }
    if (!/(^|\.)atlassian\.net$/i.test(siteUrlGuard.url!.hostname) &&
        !/(^|\.)jira\.com$/i.test(siteUrlGuard.url!.hostname)) {
      throw new Error('Jira URL must be an Atlassian domain');
    }
    const safeSiteUrl = `${siteUrlGuard.url!.protocol}//${siteUrlGuard.url!.host}`;

    // Board is optional. Only validate if provided.
    let boardId: string | null = jiraBoardId || null;
    let safeBoardUrl: string | null = null;
    if (jiraBoardUrl || jiraBoardId) {
      const candidateBoardUrl = jiraBoardUrl || `${safeSiteUrl}/jira/software/c/projects/board/${jiraBoardId}`;
      const boardUrlGuard = validateExternalUrl(candidateBoardUrl);
      if (!boardUrlGuard.ok) {
        throw new Error('Invalid Jira board URL');
      }
      safeBoardUrl = boardUrlGuard.url!.toString();
      const boardIdMatch = candidateBoardUrl.match(/board[s]?\/(\d+)/) || candidateBoardUrl.match(/[?&]rapidView=(\d+)/);
      boardId = jiraBoardId || (boardIdMatch ? boardIdMatch[1] : null);
    }

    const authHeader = jiraEmail
      ? `Basic ${btoa(`${jiraEmail}:${jiraApiToken}`)}`
      : `Bearer ${jiraApiToken}`;

    let boardData: any = null;

    if (boardId) {
      // Verify board access
      const jiraApiUrl = `${safeSiteUrl}/rest/agile/1.0/board/${boardId}`;
      const jiraResponse = await fetch(jiraApiUrl, {
        method: 'GET',
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
      });
      if (!jiraResponse.ok) {
        const errText = await jiraResponse.text();
        console.error('Jira board fetch failed:', jiraResponse.status, errText.substring(0, 200));
        throw new Error(`Jira authentication failed (${jiraResponse.status}). Check your email and API token.`);
      }
      boardData = await jiraResponse.json();
      console.log('Connected to Jira board:', boardData.name);
    } else {
      // No board provided — verify credentials with /myself
      const meResponse = await fetch(`${safeSiteUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
      });
      if (!meResponse.ok) {
        const errText = await meResponse.text();
        console.error('Jira /myself failed:', meResponse.status, errText.substring(0, 200));
        throw new Error(`Jira authentication failed (${meResponse.status}). Check your email and API token.`);
      }
      const me = await meResponse.json();
      boardData = { name: me.displayName ? `${me.displayName}'s Jira` : 'Jira site' };
      console.log('Jira credentials verified for:', me.emailAddress || me.accountId);
    }

    if (inputJiraApiToken) {
      const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
      if (!encryptionKey) throw new Error('Token encryption key not configured');
      const encryptedToken = await encryptToken(inputJiraApiToken, encryptionKey);
      const encryptedJiraEmail = jiraEmail ? await encryptToken(jiraEmail, encryptionKey) : null;
      const encryptedJiraSiteUrl = await encryptToken(safeSiteUrl, encryptionKey);
      const { error: tokenSaveError } = await supabaseClient
        .from('user_jira_tokens')
        .upsert({
          user_id: user.id,
          encrypted_token: encryptedToken,
          encrypted_jira_email: encryptedJiraEmail,
          encrypted_jira_site_url: encryptedJiraSiteUrl,
          oauth_provider: 'pat',
          is_valid: true,
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (tokenSaveError) throw tokenSaveError;
    }

    // Resolve project ID
    const projectId = inputProjectId || (workspaceId ? await resolveProjectId(supabaseClient, workspaceId) : null);
    
    if (!projectId) {
      throw new Error('Project not found');
    }

    // Save to unified integrations table
    await upsertIntegrationConfig(supabaseClient, projectId, 'jira', {
      board_url: safeBoardUrl,
      board_id: boardId,
      site_url: safeSiteUrl,
      project_key: boardData?.location?.projectKey || null,
    }, 'Jira');

    return new Response(
      JSON.stringify({
        success: true,
        boardName: boardData.name,
        boardId: boardId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in connect-jira function:', error);
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
