import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM encryption
async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  
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
  
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
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
    
    let stateData: { userId: string; redirectUrl: string };
    try {
      stateData = JSON.parse(atob(state || ''));
    } catch {
      throw new Error('Invalid state parameter');
    }
    
    const clientId = Deno.env.get('JIRA_CLIENT_ID');
    const clientSecret = Deno.env.get('JIRA_CLIENT_SECRET');
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    
    if (!clientId || !clientSecret) {
      throw new Error('Jira OAuth credentials not configured');
    }
    
    if (!encryptionKey) {
      throw new Error('Token encryption key not configured');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const callbackUrl = `${supabaseUrl}/functions/v1/jira-oauth-callback`;
    
    // Exchange code for access token
    console.log('Exchanging Jira authorization code for access token...');
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: callbackUrl,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Jira token exchange failed:', errorText);
      throw new Error(`Jira token exchange failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Jira OAuth error:', tokenData.error_description);
      throw new Error(tokenData.error_description || tokenData.error);
    }
    
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in; // seconds
    const scopes = tokenData.scope?.split(' ') || [];
    
    // Calculate expiry time
    const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString();
    
    // Get accessible resources (Jira sites)
    console.log('Fetching Jira accessible resources...');
    const resourcesResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    if (!resourcesResponse.ok) {
      throw new Error('Failed to fetch Jira accessible resources');
    }
    
    const resources = await resourcesResponse.json();
    const primaryResource = resources[0]; // Use first accessible site
    
    if (!primaryResource) {
      throw new Error('No Jira sites accessible with this account');
    }
    
    // Get user info
    console.log('Fetching Jira user info...');
    const userResponse = await fetch(`https://api.atlassian.com/ex/jira/${primaryResource.id}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    let userEmail = '';
    if (userResponse.ok) {
      const userData = await userResponse.json();
      userEmail = userData.emailAddress || '';
    }
    
    // Encrypt tokens
    console.log('Encrypting tokens...');
    const encryptedAccessToken = await encryptToken(accessToken, encryptionKey);
    const encryptedRefreshToken = refreshToken ? await encryptToken(refreshToken, encryptionKey) : null;
    
    // Store in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { error: upsertError } = await supabaseClient
      .from('user_jira_tokens')
      .upsert({
        user_id: stateData.userId,
        jira_token: null, // Don't store plaintext
        encrypted_token: encryptedAccessToken,
        refresh_token: null, // Don't store plaintext
        refresh_token_encrypted: encryptedRefreshToken,
        token_expires_at: expiresAt,
        jira_email: userEmail,
        jira_site_url: primaryResource.url,
        cloud_id: primaryResource.id,
        oauth_provider: 'oauth',
        scopes: scopes,
        is_valid: true,
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });
    
    if (upsertError) {
      console.error('Failed to store Jira token:', upsertError);
      throw upsertError;
    }
    
    console.log('Jira OAuth completed successfully');
    
    const redirectUrl = stateData.redirectUrl || '/integrations';
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl + '?jira=success',
      },
    });
    
  } catch (error) {
    console.error('Error in jira-oauth-callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `/integrations?jira=error&message=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
});
