import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { accessToken, workspaceId, projectName } = await req.json();
    
    console.log('Setting up Teams channel for project:', projectName);

    if (!accessToken) {
      throw new Error('Microsoft access token required');
    }

    // Create a team channel for the project
    // First, get user's teams
    const teamsResponse = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!teamsResponse.ok) {
      throw new Error('Failed to fetch teams');
    }

    const teamsData = await teamsResponse.json();
    
    if (!teamsData.value || teamsData.value.length === 0) {
      throw new Error('No teams found. Please create a team in Microsoft Teams first.');
    }

    // Use the first team or let user select
    const teamId = teamsData.value[0].id;
    const teamName = teamsData.value[0].displayName;

    // Create a channel in the team
    const channelData = {
      displayName: `Project: ${projectName}`,
      description: `Agile project workspace for ${projectName}`,
      membershipType: 'standard',
    };

    const createChannelResponse = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
      }
    );

    if (!createChannelResponse.ok) {
      const errorText = await createChannelResponse.text();
      console.error('Teams API error:', errorText);
      throw new Error(`Failed to create Teams channel: ${createChannelResponse.status}`);
    }

    const channelResult = await createChannelResponse.json();
    console.log('Successfully created Teams channel:', channelResult.displayName);

    // Update workspace with Teams connection details
    const { error: updateError } = await supabaseClient
      .from('project_workspaces')
      .update({
        teams_channel_id: channelResult.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspaceId);

    if (updateError) {
      throw updateError;
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