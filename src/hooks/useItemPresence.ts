import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ItemPresenceState {
  user_id: string;
  user_email: string;
  user_name: string;
  item_id: string;
  item_type: string;
  action: 'viewing' | 'editing';
  timestamp: string;
}

interface UserItemPresence {
  userId: string;
  email: string;
  name: string;
  action: 'viewing' | 'editing';
}

export const useItemPresence = (itemId: string | null, itemType: string, action: 'viewing' | 'editing' = 'viewing') => {
  const [activeUsers, setActiveUsers] = useState<UserItemPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!itemId) return;

    let presenceChannel: RealtimeChannel;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Create a channel for item-specific presence
      presenceChannel = supabase.channel(`item-presence-${itemType}-${itemId}`);

      // Set up presence sync
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          const users: UserItemPresence[] = [];
          
          Object.values(state).forEach((presences: any) => {
            presences.forEach((presence: ItemPresenceState) => {
              if (presence.user_id !== user.id && presence.item_id === itemId) {
                users.push({
                  userId: presence.user_id,
                  email: presence.user_email,
                  name: presence.user_name,
                  action: presence.action,
                });
              }
            });
          });
          
          setActiveUsers(users);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track current user's presence on this item
            await presenceChannel.track({
              user_id: user.id,
              user_email: user.email || 'Unknown',
              user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              item_id: itemId,
              item_type: itemType,
              action: action,
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
  }, [itemId, itemType, action]);

  // Update presence when action changes
  useEffect(() => {
    const updatePresence = async () => {
      if (channel && itemId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await channel.track({
            user_id: user.id,
            user_email: user.email || 'Unknown',
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            item_id: itemId,
            item_type: itemType,
            action: action,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    updatePresence();
  }, [action, itemId, itemType, channel]);

  return { activeUsers };
};
