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

interface DailySignalSnapshot {
  snapshot_date: string;
  prs_merged: number;
  issues_resolved: number;
  blocked_count: number;
  wip_count: number;
  deploy_count: number;
  cycle_time_p50_hours: number | null;
  lead_time_p50_hours: number | null;
  raw_payload?: {
    repos?: string[];
    jiraSites?: string[];
  } | null;
}

export interface DailyBriefingMetrics {
  snapshotDate: string;
  pullRequestsMerged: number;
  issuesResolved: number;
  blocked: number;
  workInProgress: number;
  deployments: number;
  cycleTimeHours: number | null;
  leadTimeHours: number | null;
}

export interface BriefingData {
  status: "ok" | "no_integration" | "no_token";
  repos: string[];
  jiraSites: string[];
  shipped: { count: number; items: BriefItem[] };
  stuck: { count: number; items: BriefItem[] };
  decide: { count: number; items: BriefItem[] };
  generatedAt: string;
  intelligence: {
    used: boolean;
    provider: "lovable-ai-gateway" | "none";
    model: string | null;
    status: "generated" | "skipped" | "fallback";
    summary: string;
  };
  metrics?: DailyBriefingMetrics;
}

const noIntelligence = {
  used: false,
  provider: "none" as const,
  model: null,
  status: "skipped" as const,
  summary: "Metrics calculated directly from connected delivery data.",
};

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

      const { data: ingestPayload, error: ingestError } = await supabase.functions.invoke(
        "ingest-delivery-signals",
        { body: { projectId } },
      );
      let snapshot = (ingestPayload as { snapshot?: DailySignalSnapshot } | null)?.snapshot ?? null;

      if (!snapshot) {
        const { data: persisted } = await supabase
          .from("delivery_signals")
          .select("snapshot_date, prs_merged, issues_resolved, blocked_count, wip_count, deploy_count, cycle_time_p50_hours, lead_time_p50_hours, raw_payload")
          .eq("project_id", projectId)
          .eq("source", "combined")
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        snapshot = persisted as DailySignalSnapshot | null;
      }

      const { data: payload, error: fnError } = await supabase.functions.invoke(
        "generate-briefing",
        { body: { projectId } },
      );
      const response = payload as (BriefingData & { error?: string }) | null;

      if (snapshot) {
        const emptyBucket = { count: 0, items: [] as BriefItem[] };
        const live = response && !response.error ? response : {
          status: "ok" as const,
          repos: snapshot.raw_payload?.repos ?? [],
          jiraSites: snapshot.raw_payload?.jiraSites ?? [],
          shipped: emptyBucket,
          stuck: emptyBucket,
          decide: emptyBucket,
          intelligence: noIntelligence,
          generatedAt: new Date().toISOString(),
        };

        setData({
          ...live,
          shipped: {
            ...live.shipped,
            count: (snapshot.prs_merged ?? 0) + (snapshot.issues_resolved ?? 0),
          },
          stuck: {
            ...live.stuck,
            count: snapshot.blocked_count ?? 0,
          },
          decide: {
            ...live.decide,
            count: snapshot.wip_count ?? 0,
          },
          generatedAt: new Date().toISOString(),
          metrics: {
            snapshotDate: snapshot.snapshot_date,
            pullRequestsMerged: snapshot.prs_merged ?? 0,
            issuesResolved: snapshot.issues_resolved ?? 0,
            blocked: snapshot.blocked_count ?? 0,
            workInProgress: snapshot.wip_count ?? 0,
            deployments: snapshot.deploy_count ?? 0,
            cycleTimeHours: snapshot.cycle_time_p50_hours ?? null,
            leadTimeHours: snapshot.lead_time_p50_hours ?? null,
          },
        });
        return;
      }

      if (ingestError && fnError) {
        throw new Error(`Daily ingest failed: ${ingestError.message}. Briefing failed: ${fnError.message}`);
      }
      if (fnError) throw new Error(fnError.message);
      if (response?.error) throw new Error(response.error);
      if (!response) throw new Error("Briefing returned no data");
      setData({ ...response, intelligence: response.intelligence ?? noIntelligence });
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
