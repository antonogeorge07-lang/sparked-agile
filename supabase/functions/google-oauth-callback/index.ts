import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { verifyOAuthState, safeRedirectPath, safeOAuthOrigin, oauthCallbackUrl } from "../_shared/oauth-state.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// AES-256-GCM with PBKDF2 key derivation (matches jira-oauth-callback / github-oauth-callback)
async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    data,
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return encodeBase64(combined);
}

function htmlEscape(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function redirectHtml(targetPath: string): string {
  const safePath = safeRedirectPath(targetPath);
  const withFlag = safePath + (safePath.includes("?") ? "&" : "?") + "google_connected=true";
  const escaped = htmlEscape(withFlag);
  return `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${escaped}"></head><body>Redirecting...</body></html>`;
}

function errorRedirectHtml(message: string): string {
  const safeMsg = htmlEscape(message).slice(0, 256);
  const target = `/?error=${encodeURIComponent(safeMsg)}`;
  return `<!doctype html><html><head><meta http-equiv="refresh" content="0;url=${target}"></head><body>Authentication error</body></html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return new Response(errorRedirectHtml(error), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    if (!ENCRYPTION_KEY) {
      throw new Error('TOKEN_ENCRYPTION_KEY not configured');
    }

    // Verify the HMAC-signed state before trusting any field inside it
    const stateData = await verifyOAuthState<{ userId: string; redirectUri?: string; origin?: string }>(state);
    const { userId, redirectUri } = stateData;
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid OAuth state payload');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const callbackUrl = oauthCallbackUrl(safeOAuthOrigin(stateData.origin), 'google');

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    console.log('Token exchange successful for user:', userId);

    // Encrypt tokens using shared TOKEN_ENCRYPTION_KEY
    const accessTokenEncrypted = await encryptToken(tokens.access_token, ENCRYPTION_KEY);
    const refreshTokenEncrypted = tokens.refresh_token
      ? await encryptToken(tokens.refresh_token, ENCRYPTION_KEY)
      : null;

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const { error: upsertError } = await supabase
      .from('user_google_tokens')
      .upsert({
        user_id: userId,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_type: tokens.token_type || 'Bearer',
        expires_at: expiresAt,
        scopes: tokens.scope?.split(' ') || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      throw new Error('Failed to store tokens');
    }

    console.log('Google tokens stored successfully for user:', userId);

    const targetPath = safeRedirectPath(redirectUri || '/integrations');
    if (url.searchParams.get('response') === 'json') {
      return new Response(
        JSON.stringify({ success: true, redirectUrl: targetPath + (targetPath.includes('?') ? '&' : '?') + 'google_connected=true' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(redirectHtml(targetPath), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: unknown) {
    console.error('Google OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (new URL(req.url).searchParams.get('response') === 'json') {
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    return new Response(errorRedirectHtml(errorMessage), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
});
