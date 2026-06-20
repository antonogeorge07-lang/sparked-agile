import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { signOAuthState, safeRedirectPath, safeOAuthOrigin, oauthCallbackUrl } from "../_shared/oauth-state.ts";


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

    const { redirectUrl, origin } = await req.json();
    
    const clientId = Deno.env.get('JIRA_CLIENT_ID');
    if (!clientId) {
      throw new Error('Jira OAuth not configured');
    }
    
    const appOrigin = safeOAuthOrigin(origin || req.headers.get('Origin'));
    const callbackUrl = oauthCallbackUrl(appOrigin, 'jira');
    
    // Create state with user ID and redirect URL
    const state = await signOAuthState({
      userId: user.id,
      redirectUrl: safeRedirectPath(redirectUrl, '/integrations'),
      origin: appOrigin,
    });

    
    // Jira OAuth 2.0 scopes
    const scopes = [
      'read:jira-work',
      'read:jira-user',
      'write:jira-work',
      'offline_access', // For refresh token
    ].join(' ');
    
    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&response_type=code&prompt=consent`;
    
    console.log('Jira OAuth init for user:', user.id);
    
    return new Response(
      JSON.stringify({ authUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in jira-oauth-init:', error);
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
