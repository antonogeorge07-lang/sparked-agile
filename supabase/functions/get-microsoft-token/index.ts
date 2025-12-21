import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();

    console.log('Exchanging code for access token');

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft credentials not configured');
    }

    if (!code || !redirectUri) {
      throw new Error('Code and redirectUri are required');
    }

    // Create Supabase client with user's auth
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

    // Exchange authorization code for access token (using 'common' for multi-tenant)
    const tokenEndpoint = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
    
    const formData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read https://graph.microsoft.com/Group.ReadWrite.All https://graph.microsoft.com/Channel.Create offline_access',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange error:', errorText);
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const tokenData = await response.json();
    console.log('Access token obtained successfully');

    // Get user's email from Microsoft Graph
    let userEmail = null;
    try {
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userEmail = userData.mail || userData.userPrincipalName;
      }
    } catch (e) {
      console.warn('Could not fetch user email:', e);
    }

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

    // Store token securely in database
    const { error: upsertError } = await supabaseClient
      .from('user_microsoft_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: expiresAt.toISOString(),
        scopes: tokenData.scope?.split(' ') || [],
        user_email: userEmail,
        is_valid: true,
        last_validated_at: new Date().toISOString(),
        validation_error: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Error storing token:', upsertError);
      throw new Error('Failed to store token securely');
    }

    console.log('Token stored securely in database');

    return new Response(
      JSON.stringify({
        success: true,
        userEmail,
        expiresAt: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in get-microsoft-token function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
