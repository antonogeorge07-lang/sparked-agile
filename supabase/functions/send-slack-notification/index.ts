import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
}

async function sendSlackMessage(token: string, message: SlackMessage): Promise<boolean> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();
  if (!result.ok) {
    console.error('Slack API error:', result.error);
    return false;
  }
  return true;
}

function buildCeremonyReminderBlocks(ceremonyType: string, projectName: string, scheduledTime: string) {
  const emoji = {
    'standup': '🧍',
    'retrospective': '🔄',
    'sprint_planning': '📋',
    'sprint_review': '🎯',
    'backlog_refinement': '📝',
  }[ceremonyType] || '📌';

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} ${ceremonyType.replace('_', ' ').toUpperCase()} Reminder`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Project:*\n${projectName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Scheduled:*\n${new Date(scheduledTime).toLocaleString()}`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ];
}

function buildProjectUpdateBlocks(updateType: string, details: any, projectName: string) {
  const emoji = {
    'task_completed': '✅',
    'task_created': '📝',
    'epic_status_change': '🎯',
    'milestone_reached': '🏆',
  }[updateType] || '📢';

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} Project Update: ${projectName}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: details.message || `*${updateType.replace('_', ' ')}*\n${details.title || 'Update'}`,
      },
    },
    {
      type: 'divider',
    },
  ];
}

function buildAISummaryBlocks(summaryType: string, summary: string, projectName: string) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🤖 AI ${summaryType} Summary: ${projectName}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: summary.length > 2900 ? summary.substring(0, 2900) + '...' : summary,
      },
    },
    {
      type: 'divider',
    },
  ];
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

    const { 
      projectId, 
      notificationType, 
      payload 
    } = await req.json();

    if (!projectId || !notificationType) {
      throw new Error('projectId and notificationType are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get project info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Project not found');
    }

    // Get active Slack channel mappings for this project and notification type
    const { data: channels, error: channelsError } = await supabase
      .from('project_slack_channels')
      .select(`
        channel_id,
        channel_name,
        notification_types,
        slack_token_id,
        user_slack_tokens (
          encrypted_access_token,
          is_valid
        )
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .contains('notification_types', [notificationType]);

    if (channelsError) {
      console.error('Failed to fetch Slack channels:', channelsError);
      throw new Error('Failed to fetch Slack channels');
    }

    if (!channels || channels.length === 0) {
      console.log('No Slack channels configured for this notification type');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No Slack channels configured',
          sent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const channel of channels) {
      try {
        const tokenData = channel.user_slack_tokens as any;
        if (!tokenData?.encrypted_access_token || !tokenData.is_valid) {
          console.log('Skipping invalid token for channel:', channel.channel_id);
          continue;
        }

        const accessToken = await decryptToken(tokenData.encrypted_access_token, encryptionKey);

        let blocks: any[];
        let text: string;

        switch (notificationType) {
          case 'ceremony_reminders':
            blocks = buildCeremonyReminderBlocks(
              payload.ceremonyType,
              project.name,
              payload.scheduledTime
            );
            text = `${payload.ceremonyType.replace('_', ' ')} reminder for ${project.name}`;
            break;

          case 'project_updates':
            blocks = buildProjectUpdateBlocks(
              payload.updateType,
              payload.details,
              project.name
            );
            text = `Project update: ${payload.updateType} in ${project.name}`;
            break;

          case 'ai_summaries':
            blocks = buildAISummaryBlocks(
              payload.summaryType,
              payload.summary,
              project.name
            );
            text = `AI ${payload.summaryType} summary for ${project.name}`;
            break;

          default:
            blocks = [{
              type: 'section',
              text: { type: 'mrkdwn', text: payload.message || 'Notification from Spark-Agile' }
            }];
            text = payload.message || 'Notification from Spark-Agile';
        }

        const success = await sendSlackMessage(accessToken, {
          channel: channel.channel_id,
          text,
          blocks,
        });

        if (success) {
          sentCount++;
          console.log('Slack notification sent to channel:', channel.channel_name);
        }
      } catch (channelError: unknown) {
        const channelErrorMsg = channelError instanceof Error ? channelError.message : 'Unknown error';
        console.error('Failed to send to channel:', channel.channel_id, channelError);
        errors.push(`Channel ${channel.channel_name}: ${channelErrorMsg}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: channels.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send Slack notification error:', error);
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
