import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BriefItem {
  source: "github" | "jira";
  key: string;
  title: string;
  author: string;
  url: string;
  context: string;
  updatedAt: string;
}

export interface BriefingData {
  status: "ok" | "no_integration" | "no_token";
  repos: string[];
  jiraSites: string[];
  shipped: { count: number; items: BriefItem[] };
  stuck: { count: number; items: BriefItem[] };
  decide: { count: number; items: BriefItem[] };
  generatedAt: string;
}

export function useBriefing() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not signed in");
        setLoading(false);
        return;
      }
      const { data: payload, error: fnError } = await supabase.functions.invoke(
        "generate-briefing",
        { body: {} },
      );
      if (fnError) throw new Error(fnError.message);
      if ((payload as any)?.error) throw new Error((payload as any).error);
      setData(payload as BriefingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load briefing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
