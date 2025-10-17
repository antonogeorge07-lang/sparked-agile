import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    let presenceChannel: RealtimeChannel;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Create a channel for presence
      presenceChannel = supabase.channel('collaboration-presence');

      // Set up presence sync
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
          if (status === 'SUBSCRIBED') {
            // Track current user's presence
            await presenceChannel.track({
              user_id: user.id,
              user_email: user.email || 'Unknown',
              user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              page: currentPage,
              timestamp: new Date().toISOString(),
            });
          }
        });

      setChannel(presenceChannel);
    };

    setupPresence();

    return () => {
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, [currentPage]);

  // Update presence when page changes
  useEffect(() => {
    const updatePresence = async () => {
      if (channel) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await channel.track({
            user_id: user.id,
            user_email: user.email || 'Unknown',
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            page: currentPage,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    updatePresence();
  }, [currentPage, channel]);

  return { activeUsers };
};
