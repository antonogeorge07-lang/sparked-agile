import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { upsertIntegrationConfig, resolveProjectId } from "../_shared/integration-resolver.ts";

// AES-256-GCM encryption (matches github-oauth-callback)
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

    const { githubRepoUrl, workspaceId, projectId: inputProjectId, githubToken } = await req.json();
    
    console.log('Connecting to GitHub repo:', githubRepoUrl);

    // Use user-provided token, encrypted user token, or fall back to system token
    let tokenToUse = githubToken;
    
    if (!tokenToUse) {
      const { data: userTokenInfo } = await supabaseClient
        .from('user_github_tokens_safe')
        .select('has_token')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userTokenInfo?.has_token) {
        const decryptResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/decrypt-token`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
            'X-Caller-Function': 'connect-github',
          },
          body: JSON.stringify({ integrationType: 'github' }),
        });
        if (decryptResponse.ok) {
          const decrypted = await decryptResponse.json();
          tokenToUse = decrypted.token;
        }
      }

      if (!tokenToUse) tokenToUse = Deno.env.get('GITHUB_TOKEN');
    }

    if (!tokenToUse) {
      throw new Error('No GitHub token available. Please provide your Personal Access Token.');
    }

    // Extract owner and repo from URL
    const repoMatch = githubRepoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!repoMatch) {
      throw new Error('Invalid GitHub repository URL. Please use format: https://github.com/owner/repository');
    }

    const [, owner, repo] = repoMatch;
    const repoName = `${owner}/${repo.replace('.git', '')}`;

    // Test connection by fetching repository details
    const githubResponse = await fetch(`https://api.github.com/repos/${repoName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenToUse}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SM-ActiveIntelligence',
      },
    });

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json().catch(() => ({}));
      console.error('GitHub API error:', errorData);
      
      if (githubResponse.status === 401) {
        throw new Error('Invalid GitHub token. Please check your Personal Access Token has the correct permissions (repo scope).');
      } else if (githubResponse.status === 404) {
        throw new Error('Repository not found. Please check the URL and ensure your token has access to this repository.');
      }
      
      throw new Error(`GitHub API error: ${errorData.message || githubResponse.status}`);
    }

    const repoData = await githubResponse.json();
    console.log('Successfully connected to GitHub repo:', repoData.full_name);

    // Store user's GitHub token for future use if provided
    if (githubToken) {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SM-ActiveIntelligence',
        },
      });
      
      const githubUser = await userResponse.json().catch(() => ({}));

      const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
      if (!encryptionKey) {
        throw new Error('Token encryption key not configured');
      }
      const encryptedToken = await encryptToken(githubToken, encryptionKey);

      const { error: tokenSaveError } = await supabaseClient
        .from('user_github_tokens')
        .upsert({
          user_id: user.id,
          encrypted_token: encryptedToken,
          oauth_provider: 'pat',
          github_username: githubUser.login || null,
          is_valid: true,
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (tokenSaveError) throw tokenSaveError;
    }

    // Resolve project ID
    const projectId = inputProjectId || (workspaceId ? await resolveProjectId(supabaseClient, workspaceId) : null);
    
    if (!projectId) {
      throw new Error('Could not determine project ID');
    }

    // Save to unified integrations table
    await upsertIntegrationConfig(supabaseClient, projectId, 'github', {
      repo_url: githubRepoUrl,
      repo_name: repoName,
    }, 'GitHub');

    return new Response(
      JSON.stringify({
        success: true,
        repoName: repoData.full_name,
        repoDescription: repoData.description,
        defaultBranch: repoData.default_branch,
        openIssues: repoData.open_issues_count,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in connect-github function:', error);
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
