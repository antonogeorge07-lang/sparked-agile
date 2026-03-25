import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { upsertIntegrationConfig, resolveProjectId } from "../_shared/integration-resolver.ts";

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

    const { teamId, teamName, channelName, workspaceId, projectId: inputProjectId, accessToken } = await req.json();
    
    console.log('Setting up Teams channel:', channelName, 'in team:', teamName);

    if (!accessToken) {
      throw new Error('Microsoft access token required');
    }

    // Create the channel in Microsoft Teams
    const createChannelResponse = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: channelName,
          description: `Project channel for ${teamName}`,
        }),
      }
    );

    if (!createChannelResponse.ok) {
      const errorText = await createChannelResponse.text();
      console.error('Teams API error:', errorText);
      throw new Error(`Failed to create Teams channel: ${createChannelResponse.status}`);
    }

    const channelResult = await createChannelResponse.json();
    console.log('Successfully created Teams channel:', channelResult.displayName);

    // Resolve project ID
    const projectId = inputProjectId || (workspaceId ? await resolveProjectId(supabaseClient, workspaceId) : null);

    if (projectId) {
      // Save to unified integrations table
      await upsertIntegrationConfig(supabaseClient, projectId, 'microsoft', {
        teams_channel_id: channelResult.id,
      }, 'Microsoft');
    }

    // Also update legacy project_workspaces for backward compatibility
    if (workspaceId) {
      await supabaseClient
        .from('project_workspaces')
        .update({
          teams_channel_id: channelResult.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workspaceId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        channelId: channelResult.id,
        channelName: channelResult.displayName,
        teamName: teamName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in setup-teams-channel function:', error);
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
