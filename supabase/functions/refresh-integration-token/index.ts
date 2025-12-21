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

// AES-256-GCM decryption
async function decryptToken(encryptedData: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
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
    ["decrypt"]
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    encrypted
  );
  
  return decoder.decode(decrypted);
}

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

    const { integrationType } = await req.json();
    
    if (!['jira', 'microsoft'].includes(integrationType)) {
      throw new Error('Invalid integration type. Only jira and microsoft support token refresh.');
    }
    
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('Token encryption key not configured');
    }
    
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    if (integrationType === 'jira') {
      // Get current Jira token
      const { data: jiraToken, error: fetchError } = await serviceClient
        .from('user_jira_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError || !jiraToken) {
        throw new Error('Jira token not found');
      }
      
      if (!jiraToken.refresh_token_encrypted) {
        throw new Error('No refresh token available. Please reconnect Jira.');
      }
      
      // Decrypt refresh token
      const refreshToken = await decryptToken(jiraToken.refresh_token_encrypted, encryptionKey);
      
      // Refresh the token
      const clientId = Deno.env.get('JIRA_CLIENT_ID');
      const clientSecret = Deno.env.get('JIRA_CLIENT_SECRET');
      
      const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh Jira token');
      }
      
      const tokenData = await tokenResponse.json();
      
      // Encrypt new tokens
      const newEncryptedAccess = await encryptToken(tokenData.access_token, encryptionKey);
      const newEncryptedRefresh = tokenData.refresh_token 
        ? await encryptToken(tokenData.refresh_token, encryptionKey)
        : jiraToken.refresh_token_encrypted;
      
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      
      // Update database
      const { error: updateError } = await serviceClient
        .from('user_jira_tokens')
        .update({
          encrypted_token: newEncryptedAccess,
          refresh_token_encrypted: newEncryptedRefresh,
          token_expires_at: expiresAt,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      console.log('Jira token refreshed successfully');
      
    } else if (integrationType === 'microsoft') {
      // Get current Microsoft token
      const { data: msToken, error: fetchError } = await serviceClient
        .from('user_microsoft_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError || !msToken) {
        throw new Error('Microsoft token not found');
      }
      
      if (!msToken.refresh_token) {
        throw new Error('No refresh token available. Please reconnect Microsoft.');
      }
      
      // Refresh the token
      const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
      const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
      
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: msToken.refresh_token,
          scope: 'Calendars.ReadWrite Mail.Send offline_access',
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh Microsoft token');
      }
      
      const tokenData = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      
      // Update database
      const { error: updateError } = await serviceClient
        .from('user_microsoft_tokens')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || msToken.refresh_token,
          expires_at: expiresAt,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      console.log('Microsoft token refreshed successfully');
    }
    
    return new Response(
      JSON.stringify({ success: true, message: `${integrationType} token refreshed successfully` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in refresh-integration-token:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
