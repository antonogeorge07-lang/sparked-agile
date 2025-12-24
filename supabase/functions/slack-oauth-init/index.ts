import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('SLACK_CLIENT_ID');
    if (!clientId) {
      throw new Error('SLACK_CLIENT_ID not configured');
    }

    const { redirectUri, state } = await req.json();
    
    if (!redirectUri) {
      throw new Error('redirectUri is required');
    }

    // Slack OAuth scopes for bot functionality
    const scopes = [
      'channels:read',
      'chat:write',
      'chat:write.public',
      'users:read',
      'team:read',
    ].join(',');

    // Build Slack OAuth URL
    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    if (state) {
      authUrl.searchParams.set('state', state);
    }

    console.log('Generated Slack OAuth URL for redirect:', redirectUri);

    return new Response(
      JSON.stringify({ 
        url: authUrl.toString(),
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Slack OAuth init error:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
