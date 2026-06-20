import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "spark_referrer_id";

/**
 * Captures `?ref=<uuid>` from the URL into localStorage on mount,
 * and on auth state change persists it onto the user's profile
 * (only if their profile.referrer_id is currently null).
 */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
        localStorage.setItem(STORAGE_KEY, ref);
      }
    } catch {}

    const apply = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      if (session.user.id === stored) return; // never self-refer
      const { data: profile } = await supabase
        .from("profiles")
        .select("referrer_id")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!profile || profile.referrer_id) {
        if (profile?.referrer_id) localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ referrer_id: stored })
        .eq("id", session.user.id);
      if (!error) localStorage.removeItem(STORAGE_KEY);
    };

    apply();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      apply();
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
