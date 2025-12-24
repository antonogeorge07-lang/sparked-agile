import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Encrypt token using AES-256-GCM
async function encryptToken(token: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  
  const keyBuffer = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('SLACK_CLIENT_ID');
    const clientSecret = Deno.env.get('SLACK_CLIENT_SECRET');
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret || !encryptionKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const { code, redirectUri, userId } = await req.json();

    if (!code || !redirectUri || !userId) {
      throw new Error('code, redirectUri, and userId are required');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData.error);
      throw new Error(`Slack OAuth failed: ${tokenData.error}`);
    }

    console.log('Slack OAuth successful for team:', tokenData.team?.name);

    // Encrypt tokens
    const encryptedAccessToken = await encryptToken(tokenData.access_token, encryptionKey);
    const encryptedBotToken = tokenData.bot_user_id ? 
      await encryptToken(tokenData.access_token, encryptionKey) : null;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store tokens in database
    const { data, error } = await supabase
      .from('user_slack_tokens')
      .upsert({
        user_id: userId,
        team_id: tokenData.team.id,
        team_name: tokenData.team.name,
        encrypted_access_token: encryptedAccessToken,
        encrypted_bot_token: encryptedBotToken,
        scopes: tokenData.scope?.split(',') || [],
        is_valid: true,
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,team_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store Slack tokens:', error);
      throw new Error('Failed to store Slack tokens');
    }

    console.log('Slack tokens stored successfully for user:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        teamId: tokenData.team.id,
        teamName: tokenData.team.name,
        tokenId: data.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Slack OAuth callback error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
