import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  type: "action_item" | "workflow" | "integration" | "nudge";
  severity?: "info" | "warning" | "urgent";
  created_at: string;
  read: boolean;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadRecentNotifications();
    
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'action_items' },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: `New action item: ${payload.new.title}`,
            type: "action_item",
            created_at: payload.new.created_at,
            read: false,
          };
          setNotifications(prev => [newNotification, ...prev].slice(0, 15));
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'smart_nudges' },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            type: "nudge",
            severity: payload.new.severity,
            created_at: payload.new.created_at,
            read: false,
          };
          setNotifications(prev => [newNotification, ...prev].slice(0, 15));
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRecentNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load action items
      const { data: actionItems } = await supabase
        .from('action_items')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Load smart nudges
      const { data: nudges } = await supabase
        .from('smart_nudges')
        .select('id, title, severity, created_at, is_read')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      const allNotifs: Notification[] = [
        ...(nudges || []).map(n => ({
          id: n.id,
          title: n.title,
          type: "nudge" as const,
          severity: n.severity as "info" | "warning" | "urgent",
          created_at: n.created_at,
          read: n.is_read,
        })),
        ...(actionItems || []).map(item => ({
          id: item.id,
          title: `Action item: ${item.title}`,
          type: "action_item" as const,
          created_at: item.created_at,
          read: false,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifs.slice(0, 15));
      setUnreadCount(allNotifs.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[300px]">
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const NudgeIcon = notification.severity === 'urgent' ? AlertTriangle : 
                                    notification.severity === 'warning' ? Zap : Info;
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border text-sm ${
                        !notification.read ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notification.type === 'nudge' && (
                          <NudgeIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            notification.severity === 'urgent' ? 'text-destructive' : 
                            notification.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'
                          }`} />
                        )}
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No notifications yet
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
