import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SlackChannel {
  id: string;
  name: string;
  topic: string;
  memberCount: number;
  isPrivate: boolean;
}

export interface SlackMessage {
  ts: string;
  text: string;
  user: string;
  userName: string;
  timestamp: string;
  threadTs: string | null;
  replyCount: number;
}

export function useSlackMessages() {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    setIsLoadingChannels(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('slack-messages', {
        body: { action: 'list_channels' },
      });
      if (fnError) throw fnError;
      if (data?.needsSetup) {
        setIsConnected(false);
        return;
      }
      setIsConnected(true);
      setChannels(data?.channels || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Slack channels');
      setIsConnected(false);
    } finally {
      setIsLoadingChannels(false);
    }
  }, []);

  const fetchMessages = useCallback(async (channelId: string, limit = 25) => {
    setIsLoadingMessages(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('slack-messages', {
        body: { action: 'fetch_messages', channel: channelId, limit },
      });
      if (fnError) throw fnError;
      setMessages(data?.messages || []);
    } catch (err: any) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (channelId: string, text: string) => {
    setIsSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('slack-messages', {
        body: { action: 'send_message', channel: channelId, text },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      toast.success('Message sent to Slack');
      // Refresh messages
      await fetchMessages(channelId);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [fetchMessages]);

  return {
    channels, messages, isLoadingChannels, isLoadingMessages, isSending,
    isConnected, error,
    fetchChannels, fetchMessages, sendMessage,
  };
}
