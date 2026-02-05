import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption using AES-GCM
async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return encodeBase64(combined);
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
      return new Response(
        `<html><body><script>window.location.href = '/?error=${encodeURIComponent(error)}';</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const ENCRYPTION_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'default-key';
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Decode state
    const stateData = JSON.parse(atob(state));
    const { userId, redirectUri } = stateData;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const callbackUrl = `${supabaseUrl}/functions/v1/google-oauth-callback`;

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

    // Encrypt tokens before storing
    const accessTokenEncrypted = await encryptToken(tokens.access_token, ENCRYPTION_KEY);
    const refreshTokenEncrypted = tokens.refresh_token 
      ? await encryptToken(tokens.refresh_token, ENCRYPTION_KEY)
      : null;

    // Store tokens in database
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

    // Redirect back to app
    const finalRedirect = redirectUri || '/integrations';
    return new Response(
      `<html><body><script>window.location.href = '${finalRedirect}?google_connected=true';</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: unknown) {
    console.error('Google OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `<html><body><script>window.location.href = '/?error=${encodeURIComponent(errorMessage)}';</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
