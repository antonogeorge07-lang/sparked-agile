import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  num_members?: number;
}

interface SlackConnection {
  id: string;
  teamId: string;
  teamName: string;
  isValid: boolean;
  lastValidated: string | null;
}

interface ProjectSlackChannel {
  id: string;
  channelId: string;
  channelName: string;
  notificationTypes: string[];
  isActive: boolean;
}

export const useSlackIntegration = () => {
  const [connection, setConnection] = useState<SlackConnection | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [projectChannels, setProjectChannels] = useState<ProjectSlackChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetchingChannels, setIsFetchingChannels] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_slack_tokens')
        .select('id, team_id, team_name, is_valid, last_validated_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to check Slack connection:', error);
        return;
      }

      if (data) {
        setConnection({
          id: data.id,
          teamId: data.team_id,
          teamName: data.team_name || 'Slack Workspace',
          isValid: data.is_valid ?? true,
          lastValidated: data.last_validated_at,
        });
      } else {
        setConnection(null);
      }
    } catch (error) {
      console.error('Failed to check Slack connection:', error);
    }
  }, []);

  const connectSlack = useCallback(async () => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const state = Math.random().toString(36).substring(7);
      
      // Store state for verification
      sessionStorage.setItem('slack_oauth_state', state);
      sessionStorage.setItem('slack_redirect_path', window.location.pathname);

      const { data, error } = await supabase.functions.invoke('slack-oauth-init', {
        body: { redirectUri, state }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Failed to get OAuth URL');

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Slack OAuth init error:', error);
      setIsConnecting(false);
      throw error;
    }
  }, []);

  const handleOAuthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const redirectUri = `${window.location.origin}${window.location.pathname}`;

      const { data, error } = await supabase.functions.invoke('slack-oauth-callback', {
        body: { code, redirectUri, userId: user.id }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'OAuth callback failed');

      await checkConnection();
      return { success: true, teamName: data.teamName };
    } catch (error: any) {
      console.error('Slack OAuth callback error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  const fetchChannels = useCallback(async () => {
    if (!connection) return;
    
    setIsFetchingChannels(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-slack-channels', {
        body: { tokenId: connection.id }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch channels');

      setChannels(data.channels || []);
    } catch (error: any) {
      console.error('Failed to fetch Slack channels:', error);
      throw error;
    } finally {
      setIsFetchingChannels(false);
    }
  }, [connection]);

  const fetchProjectChannels = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_slack_channels')
        .select('id, channel_id, channel_name, notification_types, is_active')
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (error) throw error;

      setProjectChannels(data?.map(ch => ({
        id: ch.id,
        channelId: ch.channel_id,
        channelName: ch.channel_name || 'Unknown',
        notificationTypes: ch.notification_types || [],
        isActive: ch.is_active,
      })) || []);
    } catch (error) {
      console.error('Failed to fetch project channels:', error);
    }
  }, []);

  const addProjectChannel = useCallback(async (
    projectId: string,
    channelId: string,
    channelName: string,
    notificationTypes: string[]
  ) => {
    if (!connection) throw new Error('Slack not connected');

    try {
      const { error } = await supabase
        .from('project_slack_channels')
        .upsert({
          project_id: projectId,
          slack_token_id: connection.id,
          channel_id: channelId,
          channel_name: channelName,
          notification_types: notificationTypes,
          is_active: true,
        }, {
          onConflict: 'project_id,channel_id'
        });

      if (error) throw error;
      await fetchProjectChannels(projectId);
    } catch (error) {
      console.error('Failed to add project channel:', error);
      throw error;
    }
  }, [connection, fetchProjectChannels]);

  const removeProjectChannel = useCallback(async (projectId: string, channelId: string) => {
    try {
      const { error } = await supabase
        .from('project_slack_channels')
        .delete()
        .eq('project_id', projectId)
        .eq('channel_id', channelId);

      if (error) throw error;
      await fetchProjectChannels(projectId);
    } catch (error) {
      console.error('Failed to remove project channel:', error);
      throw error;
    }
  }, [fetchProjectChannels]);

  const disconnectSlack = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_slack_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setConnection(null);
      setChannels([]);
      setProjectChannels([]);
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
      throw error;
    }
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    connection,
    channels,
    projectChannels,
    isLoading,
    isConnecting,
    isFetchingChannels,
    checkConnection,
    connectSlack,
    handleOAuthCallback,
    fetchChannels,
    fetchProjectChannels,
    addProjectChannel,
    removeProjectChannel,
    disconnectSlack,
  };
};
