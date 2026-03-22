import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  workspace_id: string;
  author_id: string;
  content: string;
  reply_to_id: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
}

export function useWorkspaceChat(workspaceId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspace_chat_messages')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) throw error;

      // Enrich with author names
      const authorIds = [...new Set((data || []).map(m => m.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, { name: p.full_name, avatar: p.avatar_url }])
      );

      setMessages(
        (data || []).map(m => ({
          ...m,
          is_pinned: m.is_pinned ?? false,
          author_name: profileMap.get(m.author_id)?.name || 'Team Member',
          author_avatar: profileMap.get(m.author_id)?.avatar || undefined,
        }))
      );
    } catch (err: any) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Subscribe to realtime
  useEffect(() => {
    if (!workspaceId) return;
    fetchMessages();

    const channel = supabase
      .channel(`workspace-chat-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_chat_messages',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            // Fetch author profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newMsg.author_id)
              .maybeSingle();

            setMessages(prev => [
              ...prev,
              {
                ...newMsg,
                is_pinned: newMsg.is_pinned ?? false,
                author_name: profile?.full_name || 'Team Member',
                author_avatar: profile?.avatar_url || undefined,
              },
            ]);
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(m => (m.id === (payload.new as any).id ? { ...m, ...payload.new } : m))
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [workspaceId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      if (!workspaceId || !content.trim()) return false;
      setSending(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase.from('workspace_chat_messages').insert({
          workspace_id: workspaceId,
          author_id: user.id,
          content: content.trim(),
          reply_to_id: replyToId || null,
        });

        if (error) throw error;
        return true;
      } catch (err: any) {
        toast.error(err.message || 'Failed to send message');
        return false;
      } finally {
        setSending(false);
      }
    },
    [workspaceId]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_chat_messages')
        .delete()
        .eq('id', messageId);
      if (error) throw error;
    } catch (err: any) {
      toast.error('Failed to delete message');
    }
  }, []);

  return { messages, loading, sending, sendMessage, deleteMessage, refresh: fetchMessages };
}
