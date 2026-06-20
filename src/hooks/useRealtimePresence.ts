import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  user_id: string;
  user_email: string;
  user_name: string;
  page: string;
  timestamp: string;
}

interface UserPresence {
  userId: string;
  email: string;
  name: string;
  page: string;
}

export const useRealtimePresence = (currentPage: string) => {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Tear down any pre-existing channel before allocating a new one.
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // Unique channel name per mount to avoid reusing an already-subscribed channel.
      const presenceChannel = supabase.channel(
        `collaboration-presence:${Math.random().toString(36).slice(2)}`,
        { config: { presence: { key: user.id } } }
      );
      channelRef.current = presenceChannel;

      // Attach ALL listeners BEFORE subscribing.
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const users: UserPresence[] = [];
          Object.values(state).forEach((presences: any) => {
            presences.forEach((presence: PresenceState) => {
              if (presence.user_id !== user.id) {
                users.push({
                  userId: presence.user_id,
                  email: presence.user_email,
                  name: presence.user_name,
                  page: presence.page,
                });
              }
            });
          });
          setActiveUsers(users);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && !cancelled) {
            await presenceChannel.track({
              user_id: user.id,
              user_email: user.email || 'Unknown',
              user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              page: currentPage,
              timestamp: new Date().toISOString(),
            });
          }
        });
    };

    setupPresence();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentPage]);

  return { activeUsers };
};
