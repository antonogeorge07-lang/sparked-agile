import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UseRequireAuthResult {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isNewUser: boolean;
}

/**
 * Single source of truth for Supabase authentication state.
 *
 * This hook observes the session only.
 * Route redirection is owned by AuthGuard in App.tsx.
 */
export function useRequireAuth(): UseRequireAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!active) return;

        setSession(currentSession);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;

        setSession(null);
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;

  const createdAt = user?.created_at
    ? new Date(user.created_at).getTime()
    : 0;

  const isNewUser =
    createdAt > 0 &&
    Date.now() - createdAt < 5 * 60 * 1000;

  return {
    user,
    session,
    loading,
    isNewUser,
  };
}
