import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Secure CORS with origin validation
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  
  // Extract the project ID from Supabase URL for allowed origins
  const projectMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = projectMatch ? projectMatch[1] : '';
  
  // Define allowed origins - Lovable preview, published app, and Supabase functions
  const allowedOrigins = [
    `https://${projectId}.supabase.co`,
    'https://lovable.dev',
    'https://sparked-agile.lovable.app',
  ];
  
  // Also allow any Lovable preview URLs
  const isLovablePreview = origin.includes('.lovable.app') || origin.includes('.lovableproject.com');
  const isAllowed = allowedOrigins.includes(origin) || isLovablePreview;
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Credentials': 'true',
  };
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

// Allowlist of edge functions that can call decrypt-token with service role
const ALLOWED_CALLER_FUNCTIONS = [
  'fetch-github-activity',
  'fetch-github-issues',
  'fetch-github-prs',
  'connect-github',
  'fetch-jira-backlog',
  'github-digest',
  'update-github-issue',
  'update-jira-issue',
  'create-jira-issue',
  'add-jira-comment',
  'create-github-issue',
  'create-outlook-event',
  'create-review-outlook-invite',
  'create-sprint-outlook-invite',
  'refresh-integration-token',
  'validate-integration-token',
];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !serviceRoleKey) {
      throw new Error('Unauthorized: Missing authentication');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const isServiceRoleCall = token === serviceRoleKey;
    
    // SECURITY: For service role calls, require caller identification
    // This prevents arbitrary service role access to token decryption
    const callerFunction = req.headers.get('X-Caller-Function');
    
    if (isServiceRoleCall) {
      if (!callerFunction || !ALLOWED_CALLER_FUNCTIONS.includes(callerFunction)) {
        console.error(`Unauthorized service role call from: ${callerFunction || 'unknown'}`);
        throw new Error('Unauthorized: Invalid caller function');
      }
      console.log(`Service role call authorized from: ${callerFunction}`);
    }
    
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
    
    // SECURITY FIX: Service role calls MUST still have a user context
    // We no longer accept userId from request body - this prevents RLS bypass
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { integrationType, includeMetadata } = await req.json();
    
    // SECURITY: Always use the authenticated user's ID, never from request body
    const targetUserId = user.id;
    
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
    
    // Audit log the decryption request
    try {
      await serviceClient.from('sensitive_data_access_log').insert({
        user_id: targetUserId,
        table_accessed: `user_${integrationType}_tokens`,
        access_type: 'token_decryption',
        query_context: `Decrypted ${integrationType} token${callerFunction ? ` via ${callerFunction}` : ''}`,
      });
    } catch (auditError) {
      console.warn('Failed to log audit entry:', auditError);
      // Don't fail the request if audit logging fails
    }
    
    let decryptedToken: string | null = null;
    let metadata: Record<string, string | null> = {};
    
    console.log(`Token decrypt request: integration=${integrationType}, user=${targetUserId}`);
    
    if (integrationType === 'github') {
      const { data: tokenRecord, error } = await serviceClient
        .from('user_github_tokens')
        .select('encrypted_token, oauth_provider')
        .eq('user_id', targetUserId)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('GitHub token not found');
      }
      
      if (tokenRecord.encrypted_token) {
        decryptedToken = await decryptToken(tokenRecord.encrypted_token, encryptionKey);
      } else {
        throw new Error('No token available');
      }
      
    } else if (integrationType === 'jira') {
      const { data: tokenRecord, error } = await serviceClient
        .from('user_jira_tokens')
        .select('encrypted_token, oauth_provider, token_expires_at, encrypted_jira_email, encrypted_jira_site_url, cloud_id')
        .eq('user_id', targetUserId)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('Jira token not found');
      }
      
      if (tokenRecord.token_expires_at) {
        const expiresAt = new Date(tokenRecord.token_expires_at);
        if (expiresAt <= new Date()) {
          throw new Error('Token expired. Please refresh or reconnect.');
        }
      }
      
      if (tokenRecord.encrypted_token) {
        decryptedToken = await decryptToken(tokenRecord.encrypted_token, encryptionKey);
      } else {
        throw new Error('No token available');
      }
      
      // Decrypt metadata if requested (for functions that need email/site URL)
      if (includeMetadata) {
        // Decrypt jira_email
        if (tokenRecord.encrypted_jira_email) {
          metadata.jira_email = await decryptToken(tokenRecord.encrypted_jira_email, encryptionKey);
        }
        
        // Decrypt jira_site_url
        if (tokenRecord.encrypted_jira_site_url) {
          metadata.jira_site_url = await decryptToken(tokenRecord.encrypted_jira_site_url, encryptionKey);
        }
        
        metadata.cloud_id = tokenRecord.cloud_id;
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
      
      if (tokenRecord.expires_at) {
        const expiresAt = new Date(tokenRecord.expires_at);
        if (expiresAt <= new Date()) {
          throw new Error('Token expired. Please refresh or reconnect.');
        }
      }
      
      if (tokenRecord.encrypted_access_token) {
        decryptedToken = await decryptToken(tokenRecord.encrypted_access_token, encryptionKey);
      } else if (tokenRecord.access_token && tokenRecord.access_token !== '') {
        decryptedToken = tokenRecord.access_token;
      } else {
        throw new Error('No token available');
      }
    }
    
    console.log(`Token decrypted for ${integrationType} integration`);
    
    // Build response based on whether metadata was requested
    const responseData: Record<string, unknown> = { token: decryptedToken };
    if (includeMetadata && Object.keys(metadata).length > 0) {
      responseData.metadata = metadata;
    }
    
    return new Response(
      JSON.stringify(responseData),
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
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
