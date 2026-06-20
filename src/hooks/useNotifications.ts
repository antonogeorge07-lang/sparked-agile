import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseNotificationsOptions {
  userId?: string;
  enabled?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message?: string | null;
  type?: string | null;
  severity?: "info" | "warning" | "urgent";
  created_at: string;
  read: boolean;
  link?: string | null;
}

/**
 * Consolidated realtime notifications subscription.
 *
 * Lifecycle rules:
 *  1. A single RealtimeChannel is allocated per active session.
 *  2. All `.on('postgres_changes', ...)` listeners are attached BEFORE `.subscribe()`.
 *  3. Any previously active channel is removed inside the useEffect cleanup
 *     before a new one is created.
 *  4. This is the only realtime owner for the notifications table.
 */
export const useNotifications = ({ userId, enabled = true }: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const toastQueueRef = useRef<any[]>([]);
  const isProcessingRef = useRef(false);

  const normaliseNotification = (row: any): AppNotification => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    severity: row.type === "urgent" ? "urgent" : row.type === "warning" ? "warning" : "info",
    created_at: row.created_at || new Date().toISOString(),
    read: !!row.is_read,
    link: row.link,
  });

  // Debounce toast notifications to prevent overwhelming the UI
  const queueToast = (toastConfig: any) => {
    toastQueueRef.current.push(toastConfig);

    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      setTimeout(() => {
        if (toastQueueRef.current.length > 0) {
          const nextToast = toastQueueRef.current.shift();
          toast(nextToast);
        }
        isProcessingRef.current = false;
      }, 500);
    }
  };

  const loadNotifications = useCallback(async () => {
    if (!enabled || !userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, type, created_at, is_read, link")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) {
      console.error("Failed to load notifications:", error);
      return;
    }

    const mapped = (data || []).map(normaliseNotification);
    setNotifications(mapped);
    setUnreadCount(mapped.filter((item) => !item.read).length);
  }, [enabled, userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Failed to mark notifications as read:", error);
      await loadNotifications();
    }
  }, [loadNotifications, userId]);

  useEffect(() => {
    if (!enabled || !userId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Defensive: tear down any pre-existing channel before creating a new one.
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    loadNotifications();

    // 1. Allocate a single, uniquely named channel for this hook instance.
    const channel = supabase.channel(`notifications:${userId}:${crypto.randomUUID()}`);

    // 2. Attach ALL listeners BEFORE calling .subscribe().
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const notification = normaliseNotification(payload.new);
          setNotifications((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 15));
          if (!notification.read) setUnreadCount((prev) => prev + 1);
          queueToast({
            title: notification.title,
            description: notification.message || "New notification received.",
            duration: 5000,
          });
          return;
        }

        if (payload.eventType === "UPDATE") {
          const notification = normaliseNotification(payload.new);
          setNotifications((prev) => {
            const current = prev.find((item) => item.id === notification.id);
            if (current && current.read !== notification.read) {
              setUnreadCount((count) => Math.max(0, count + (notification.read ? -1 : 1)));
            }
            return prev.map((item) => (item.id === notification.id ? notification : item));
          });
          return;
        }

        if (payload.eventType === "DELETE") {
          const deletedId = payload.old.id;
          setNotifications((prev) => {
            const deleted = prev.find((item) => item.id === deletedId);
            if (deleted && !deleted.read) setUnreadCount((count) => Math.max(0, count - 1));
            return prev.filter((item) => item.id !== deletedId);
          });
        }
      }
    );

    // 3. Subscribe LAST, only after every listener is attached.
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn(`[useNotifications] Realtime status: ${status}`);
      }
    });

    channelRef.current = channel;

    // 4. Cleanup: always remove channel on unmount or before re-creation.
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, enabled, loadNotifications]);

  return { notifications, unreadCount, markAllAsRead, refreshNotifications: loadNotifications };
};
