import { useCallback, useEffect, useState } from "react";
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

export function useBriefing(projectId?: string) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const { data: payload, error: fnError } = await supabase.functions.invoke(
        "generate-briefing",
        { body: { projectId } },
      );
      if (fnError) throw new Error(fnError.message);

      const response = payload as BriefingData & { error?: string };
      if (response?.error) throw new Error(response.error);
      setData(response);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load briefing");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
