import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";

/**
 * /home is now a thin redirect.
 * - Authenticated users -> /dashboard
 * - Guests              -> /  (Landing)
 *
 * The previous 295-line marketing rehash lived here and duplicated Landing.tsx.
 */
export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      navigate(session ? "/dashboard" : "/", { replace: true });
    })();
    return () => { active = false; };
  }, [navigate]);

  return <LoadingState />;
}
