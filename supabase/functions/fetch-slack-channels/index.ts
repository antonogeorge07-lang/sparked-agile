import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt token using AES-256-GCM
async function decryptToken(encryptedData: string, key: string): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!encryptionKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { tokenId } = await req.json();

    if (!tokenId) {
      throw new Error('tokenId is required');
    }

    // Get the Slack token
    const { data: slackToken, error: tokenError } = await supabase
      .from('user_slack_tokens')
      .select('*')
      .eq('id', tokenId)
      .eq('user_id', user.id)
      .single();

    if (tokenError || !slackToken) {
      throw new Error('Slack token not found');
    }

    if (!slackToken.is_valid) {
      throw new Error('Slack token is invalid');
    }

    const accessToken = await decryptToken(slackToken.encrypted_access_token, encryptionKey);

    // Fetch channels from Slack
    const channelsResponse = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const channelsData = await channelsResponse.json();

    if (!channelsData.ok) {
      console.error('Slack channels fetch failed:', channelsData.error);
      
      // Mark token as invalid if auth failed
      if (channelsData.error === 'token_revoked' || channelsData.error === 'invalid_auth') {
        await supabase
          .from('user_slack_tokens')
          .update({ 
            is_valid: false, 
            validation_error: channelsData.error,
            updated_at: new Date().toISOString()
          })
          .eq('id', tokenId);
      }
      
      throw new Error(`Slack API error: ${channelsData.error}`);
    }

    // Update last validated
    await supabase
      .from('user_slack_tokens')
      .update({ 
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenId);

    const channels = channelsData.channels.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      is_private: ch.is_private,
      is_member: ch.is_member,
      num_members: ch.num_members,
    }));

    console.log(`Fetched ${channels.length} channels from Slack`);

    return new Response(
      JSON.stringify({
        success: true,
        channels,
        teamName: slackToken.team_name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fetch Slack channels error:', error);
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
