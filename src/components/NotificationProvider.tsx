import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification } from "@/hooks/useNotifications";

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const defaultValue: NotificationContextValue = {
  notifications: [],
  unreadCount: 0,
  markAllAsRead: async () => undefined,
  refreshNotifications: async () => undefined,
};

const NotificationContext = createContext<NotificationContextValue>(defaultValue);

export const useNotificationContext = () => useContext(NotificationContext);

/**
 * Inner subscriber — only mounted once a userId exists. Keeping it isolated
 * guarantees a stable hook order in NotificationProvider itself and prevents
 * "change in the order of Hooks" errors when the session resolves.
 */
const NotificationSubscriber = ({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) => {
  const state = useNotifications({ userId, enabled: true });
  return (
    <NotificationContext.Provider value={state}>{children}</NotificationContext.Provider>
  );
};

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!userId) {
    return (
      <NotificationContext.Provider value={defaultValue}>{children}</NotificationContext.Provider>
    );
  }

  return (
    <NotificationSubscriber userId={userId} key={userId}>
      {children}
    </NotificationSubscriber>
  );
};
