import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UseRequireAuthResult {
  user: User | null;
  session: Session | null;
  /** True until the initial session check has resolved. */
  loading: boolean;
  /** True if the signed-in user was created within the last 5 minutes (fresh signup). */
  isNewUser: boolean;
}


/**
 * Centralised auth gate.
 *
 * - Awaits `supabase.auth.getSession()` (per Data Resilience standard).
 * - Redirects unauthenticated visitors to `/auth` (or `redirectTo` if provided).
 * - Subscribes to auth changes so logout from anywhere drops the page back to /auth.
 *
 * Replaces the 6-line getSession/navigate dance previously duplicated in 13 pages.
 */
export function useRequireAuth(redirectTo: string = "/auth"): UseRequireAuthResult {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. Subscribe FIRST to avoid missing a fast token refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) navigate(redirectTo, { replace: true });
    });

    // 2. Then read the current session.
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!active) return;
      setSession(currentSession);
      setLoading(false);
      if (!currentSession) navigate(redirectTo, { replace: true });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  const user = session?.user ?? null;
  const createdAt = user?.created_at ? new Date(user.created_at).getTime() : 0;
  const isNewUser = createdAt > 0 && Date.now() - createdAt < 5 * 60 * 1000;
  return { user, session, loading, isNewUser };
}

