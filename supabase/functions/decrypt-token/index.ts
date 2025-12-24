import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    // Validate this is a server-to-server call (from other edge functions only)
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Check if the request is using the service role key (edge function to edge function)
    // This prevents direct frontend access while allowing other edge functions to call this
    if (!authHeader || !serviceRoleKey) {
      throw new Error('Unauthorized: Missing authentication');
    }
    
    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // If using service role key directly, we need to get user from request body
    const isServiceRoleCall = token === serviceRoleKey;
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // For service role calls without user context, require userId in body
    // For regular authenticated calls, use the authenticated user
    if (!user && !isServiceRoleCall) {
      throw new Error('User not authenticated');
    }

    const { integrationType, userId: requestUserId } = await req.json();
    
    // Determine the target user ID - for service role calls, can use userId from body
    // For regular calls, must use the authenticated user's ID
    const targetUserId = user?.id ?? requestUserId;
    
    if (!targetUserId) {
      throw new Error('User ID required');
    }
    
    // Security: Only allow users to decrypt their own tokens (unless service role)
    if (user && user.id !== targetUserId && !isServiceRoleCall) {
      throw new Error('Unauthorized: Cannot access tokens for other users');
    }
    
    if (!['github', 'jira', 'microsoft'].includes(integrationType)) {
      throw new Error('Invalid integration type');
    }
    
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('Token encryption key not configured');
    }
    
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    let decryptedToken: string | null = null;
    
    // Log decrypt operation for auditing (without exposing token)
    console.log(`Token decrypt request: integration=${integrationType}, user=${targetUserId}`);
    
    if (integrationType === 'github') {
      const { data: tokenRecord, error } = await serviceClient
        .from('user_github_tokens')
        .select('encrypted_token, github_token, oauth_provider')
        .eq('user_id', targetUserId)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('GitHub token not found');
      }
      
      // Use encrypted token if available, otherwise fall back to plaintext (legacy)
      if (tokenRecord.encrypted_token) {
        decryptedToken = await decryptToken(tokenRecord.encrypted_token, encryptionKey);
      } else if (tokenRecord.github_token) {
        decryptedToken = tokenRecord.github_token;
      } else {
        throw new Error('No token available');
      }
      
    } else if (integrationType === 'jira') {
      const { data: tokenRecord, error } = await serviceClient
        .from('user_jira_tokens')
        .select('encrypted_token, jira_token, oauth_provider, token_expires_at')
        .eq('user_id', targetUserId)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('Jira token not found');
      }
      
      // Check if token is expired
      if (tokenRecord.token_expires_at) {
        const expiresAt = new Date(tokenRecord.token_expires_at);
        if (expiresAt <= new Date()) {
          throw new Error('Token expired. Please refresh or reconnect.');
        }
      }
      
      if (tokenRecord.encrypted_token) {
        decryptedToken = await decryptToken(tokenRecord.encrypted_token, encryptionKey);
      } else if (tokenRecord.jira_token) {
        decryptedToken = tokenRecord.jira_token;
      } else {
        throw new Error('No token available');
      }
    } else if (integrationType === 'microsoft') {
      const { data: tokenRecord, error } = await serviceClient
        .from('user_microsoft_tokens')
        .select('encrypted_access_token, access_token, expires_at')
        .eq('user_id', targetUserId)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('Microsoft token not found');
      }
      
      // Check if token is expired
      if (tokenRecord.expires_at) {
        const expiresAt = new Date(tokenRecord.expires_at);
        if (expiresAt <= new Date()) {
          throw new Error('Token expired. Please refresh or reconnect.');
        }
      }
      
      // Use encrypted token if available, otherwise fall back to plaintext (legacy)
      if (tokenRecord.encrypted_access_token) {
        decryptedToken = await decryptToken(tokenRecord.encrypted_access_token, encryptionKey);
      } else if (tokenRecord.access_token && tokenRecord.access_token !== '') {
        decryptedToken = tokenRecord.access_token;
      } else {
        throw new Error('No token available');
      }
    }
    
    // Return the token (this should only be used by other edge functions, not frontend)
    // For security, we don't log the token
    console.log(`Token decrypted for ${integrationType} integration`);
    
    return new Response(
      JSON.stringify({ token: decryptedToken }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in decrypt-token:', error);
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