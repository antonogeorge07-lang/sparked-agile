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
    
    let isValid = false;
    let errorMsg: string | null = null;
    let tableName: string;
    
    if (integrationType === 'github') {
      tableName = 'user_github_tokens';
      const { data: tokenRecord, error } = await serviceClient
        .from('user_github_tokens')
        .select('encrypted_token, github_token')
        .eq('user_id', user.id)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('GitHub token not found');
      }
      
      let token: string;
      if (tokenRecord.encrypted_token) {
        token = await decryptToken(tokenRecord.encrypted_token, encryptionKey);
      } else if (tokenRecord.github_token) {
        token = tokenRecord.github_token;
      } else {
        throw new Error('No token available');
      }
      
      // Validate with GitHub API
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      isValid = response.ok;
      errorMsg = isValid ? null : `Token expired or invalid (${response.status})`;
      
    } else if (integrationType === 'jira') {
      tableName = 'user_jira_tokens';
      const { data: tokenRecord, error } = await serviceClient
        .from('user_jira_tokens')
        .select('encrypted_token, jira_token, encrypted_jira_email, jira_email, encrypted_jira_site_url, jira_site_url, cloud_id')
        .eq('user_id', user.id)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('Jira token not found');
      }
      
      // Decrypt token
      let token: string;
      if (tokenRecord.encrypted_token) {
        token = await decryptToken(tokenRecord.encrypted_token, encryptionKey);
      } else if (tokenRecord.jira_token) {
        token = tokenRecord.jira_token;
      } else {
        throw new Error('No token available');
      }
      
      // Decrypt email
      let jiraEmail: string | null = null;
      if (tokenRecord.encrypted_jira_email) {
        jiraEmail = await decryptToken(tokenRecord.encrypted_jira_email, encryptionKey);
      } else if (tokenRecord.jira_email) {
        jiraEmail = tokenRecord.jira_email;
      }
      
      // Decrypt site URL
      let jiraSiteUrl: string | null = null;
      if (tokenRecord.encrypted_jira_site_url) {
        jiraSiteUrl = await decryptToken(tokenRecord.encrypted_jira_site_url, encryptionKey);
      } else if (tokenRecord.jira_site_url) {
        jiraSiteUrl = tokenRecord.jira_site_url;
      }
      
      // Validate with Jira API - use OAuth if we have cloud_id, otherwise Basic auth
      let response: Response;
      if (tokenRecord.cloud_id) {
        // OAuth 2.0 - use cloud ID
        response = await fetch(`https://api.atlassian.com/ex/jira/${tokenRecord.cloud_id}/rest/api/3/myself`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      } else if (jiraEmail && jiraSiteUrl) {
        // Basic auth with API token
        const credentials = btoa(`${jiraEmail}:${token}`);
        response = await fetch(`${jiraSiteUrl}/rest/api/3/myself`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json',
          },
        });
      } else {
        throw new Error('Missing credentials for validation');
      }
      
      isValid = response.ok;
      errorMsg = isValid ? null : `Token expired or invalid (${response.status})`;
      
    } else if (integrationType === 'microsoft') {
      tableName = 'user_microsoft_tokens';
      const { data: tokenRecord, error } = await serviceClient
        .from('user_microsoft_tokens')
        .select('encrypted_access_token, access_token, expires_at')
        .eq('user_id', user.id)
        .single();
      
      if (error || !tokenRecord) {
        throw new Error('Microsoft token not found');
      }
      
      // Check if token is expired first
      if (tokenRecord.expires_at) {
        const expiresAt = new Date(tokenRecord.expires_at);
        if (expiresAt < new Date()) {
          isValid = false;
          errorMsg = 'Token expired - please reconnect';
          
          // Update validation status
          await serviceClient
            .from('user_microsoft_tokens')
            .update({
              is_valid: false,
              last_validated_at: new Date().toISOString(),
              validation_error: errorMsg,
            })
            .eq('user_id', user.id);
          
          return new Response(
            JSON.stringify({ isValid, error: errorMsg }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      }
      
      let token: string;
      if (tokenRecord.encrypted_access_token) {
        token = await decryptToken(tokenRecord.encrypted_access_token, encryptionKey);
      } else if (tokenRecord.access_token && tokenRecord.access_token !== '') {
        token = tokenRecord.access_token;
      } else {
        throw new Error('No token available');
      }
      
      // Validate with Microsoft Graph API
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      isValid = response.ok;
      errorMsg = isValid ? null : `Token invalid (${response.status})`;
    } else {
      throw new Error('Invalid integration type');
    }
    
    // Update validation status in database
    await serviceClient
      .from(tableName!)
      .update({
        is_valid: isValid,
        last_validated_at: new Date().toISOString(),
        validation_error: errorMsg,
      })
      .eq('user_id', user.id);
    
    console.log(`${integrationType} token validated: ${isValid}`);
    
    return new Response(
      JSON.stringify({ isValid, error: errorMsg }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in validate-integration-token:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, isValid: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
