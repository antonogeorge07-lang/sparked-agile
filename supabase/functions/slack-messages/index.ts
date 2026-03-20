import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/slack/api';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { action, channel, text, limit = 20 } = await req.json();

    // Try connector gateway first, fallback to stored tokens
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SLACK_API_KEY = Deno.env.get('SLACK_API_KEY');
    const useGateway = !!LOVABLE_API_KEY && !!SLACK_API_KEY;

    // Fallback: check user_slack_tokens
    let botToken: string | null = null;
    if (!useGateway) {
      const { data: tokenData } = await supabaseClient
        .from('user_slack_tokens')
        .select('encrypted_bot_token')
        .eq('user_id', user.id)
        .eq('is_valid', true)
        .maybeSingle();

      if (tokenData?.encrypted_bot_token) {
        // Decrypt token via service
        const serviceClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        const { data: decrypted } = await serviceClient.functions.invoke('decrypt-token', {
          body: { encrypted_token: tokenData.encrypted_bot_token, token_type: 'slack' },
          headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` }
        });
        botToken = decrypted?.token || null;
      }
    }

    if (!useGateway && !botToken) {
      return new Response(
        JSON.stringify({ needsSetup: true, message: 'Slack not connected. Connect via Integration Settings.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const makeSlackRequest = async (endpoint: string, body: Record<string, any>) => {
      if (useGateway) {
        const res = await fetch(`${GATEWAY_URL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': SLACK_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        return res.json();
      } else {
        const res = await fetch(`https://slack.com/api/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        return res.json();
      }
    };

    const makeSlackGet = async (endpoint: string, params: Record<string, string> = {}) => {
      const qs = new URLSearchParams(params).toString();
      if (useGateway) {
        const res = await fetch(`${GATEWAY_URL}/${endpoint}?${qs}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': SLACK_API_KEY!,
          },
        });
        return res.json();
      } else {
        const res = await fetch(`https://slack.com/api/${endpoint}?${qs}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${botToken}` },
        });
        return res.json();
      }
    };

    let result: any = {};

    switch (action) {
      case 'list_channels': {
        const data = await makeSlackGet('conversations.list', {
          types: 'public_channel,private_channel',
          limit: '100',
          exclude_archived: 'true',
        });
        result = {
          channels: data.channels?.map((ch: any) => ({
            id: ch.id,
            name: ch.name,
            topic: ch.topic?.value || '',
            memberCount: ch.num_members || 0,
            isPrivate: ch.is_private || false,
          })) || [],
        };
        break;
      }

      case 'fetch_messages': {
        if (!channel) throw new Error('Channel ID is required');
        const data = await makeSlackGet('conversations.history', {
          channel,
          limit: String(limit),
        });
        
        // Resolve user names
        const userIds = [...new Set((data.messages || []).map((m: any) => m.user).filter(Boolean))];
        const userMap: Record<string, string> = {};
        for (const uid of userIds.slice(0, 20)) {
          try {
            const userData = await makeSlackGet('users.info', { user: uid as string });
            if (userData.user) {
              userMap[uid as string] = userData.user.real_name || userData.user.name || uid as string;
            }
          } catch { /* skip */ }
        }

        result = {
          messages: (data.messages || []).reverse().map((msg: any) => ({
            ts: msg.ts,
            text: msg.text,
            user: msg.user,
            userName: userMap[msg.user] || msg.user,
            timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
            threadTs: msg.thread_ts,
            replyCount: msg.reply_count || 0,
          })),
        };
        break;
      }

      case 'send_message': {
        if (!channel || !text) throw new Error('Channel and text are required');
        const data = await makeSlackRequest('chat.postMessage', {
          channel,
          text,
          username: 'Spark-Agile',
          icon_emoji: ':zap:',
        });
        if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
        result = { success: true, ts: data.ts };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Slack messages error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
