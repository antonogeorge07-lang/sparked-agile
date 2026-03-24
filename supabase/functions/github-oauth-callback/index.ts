import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// AES-256-GCM encryption
async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  
  // Derive a 256-bit key from the secret
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    data
  );
  
  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      throw new Error('Authorization code not provided');
    }
    
    // Parse state to get user info and redirect URL
    let stateData: { userId: string; redirectUrl: string };
    try {
      stateData = JSON.parse(atob(state || ''));
    } catch {
      throw new Error('Invalid state parameter');
    }
    
    const clientId = Deno.env.get('GITHUB_CLIENT_ID');
    const clientSecret = Deno.env.get('GITHUB_CLIENT_SECRET');
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    
    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth credentials not configured');
    }
    
    if (!encryptionKey) {
      throw new Error('Token encryption key not configured');
    }
    
    // Exchange code for access token
    console.log('Exchanging authorization code for access token...');
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token exchange failed:', errorText);
      throw new Error(`GitHub token exchange failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error_description);
      throw new Error(tokenData.error_description || tokenData.error);
    }
    
    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope?.split(',') || [];
    
    // Get user info from GitHub
    console.log('Fetching GitHub user info...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user info');
    }
    
    const userData = await userResponse.json();
    
    // Encrypt the access token
    console.log('Encrypting access token...');
    const encryptedToken = await encryptToken(accessToken, encryptionKey);
    
    // Store in database using service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Note: GitHub OAuth Apps don't have refresh tokens or expiry
    // The token is valid until revoked
    const { error: upsertError } = await supabaseClient
      .from('user_github_tokens')
      .upsert({
        user_id: stateData.userId,
        github_token: null, // Don't store plaintext
        encrypted_token: encryptedToken,
        github_username: userData.login,
        oauth_provider: 'oauth',
        scopes: scopes,
        token_expires_at: null, // OAuth App tokens don't expire
        is_valid: true,
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
    
    if (upsertError) {
      console.error('Failed to store token:', upsertError);
      throw upsertError;
    }
    
    console.log('GitHub OAuth completed successfully for user:', userData.login);
    
    // Redirect back to the app
    const redirectUrl = stateData.redirectUrl || '/integrations';
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl + '?github=success',
      },
    });
    
  } catch (error) {
    console.error('Error in github-oauth-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Redirect with error
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `/integrations?github=error&message=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
});
