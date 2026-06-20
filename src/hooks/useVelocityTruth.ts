import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "./useWorkspace";

export interface DeliverySignal {
  snapshot_date: string;
  prs_merged: number;
  issues_resolved: number;
  cycle_time_p50_hours: number | null;
  cycle_time_p90_hours: number | null;
  lead_time_p50_hours: number | null;
  wip_count: number;
  blocked_count: number;
  deploy_count: number;
}

export interface ValueTag {
  id: string;
  entity_type: "epic" | "feature";
  entity_id: string;
  value_band: "high" | "medium" | "low";
  value_type: "revenue" | "cost_saving" | "risk_reduction" | "customer" | "compliance";
  estimated_amount: number | null;
  currency: string | null;
  confidence: "low" | "medium" | "high";
  notes: string | null;
}

export interface Simulation {
  status: "ok";
  confidence: "low" | "medium" | "high";
  baseline: { teamSize: number; weeklyThroughput: number; leadTimeDays: number; dataPoints: number };
  projection: { teamSize: number; weeklyThroughput: number; leadTimeDays: number; throughputChangePct: number; leadChangePct: number };
  value: { totalScore: number; totalMonetary: number; deferredScore: number; deferredMonetary: number; valueRetainedPct: number };
  insight: string;
  generatedAt: string;
}

export function useVelocityTruth() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const [signals, setSignals] = useState<DeliverySignal[]>([]);
  const [tags, setTags] = useState<ValueTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    setError(null);
    try {
      const since = new Date(Date.now() - 84 * 86400_000).toISOString().slice(0, 10);
      const [{ data: sig, error: sErr }, { data: tg, error: tErr }] = await Promise.all([
        supabase.from("delivery_signals")
          .select("snapshot_date, prs_merged, issues_resolved, cycle_time_p50_hours, cycle_time_p90_hours, lead_time_p50_hours, wip_count, blocked_count, deploy_count")
          .eq("workspace_id", workspace.id)
          .gte("snapshot_date", since)
          .order("snapshot_date", { ascending: true }),
        supabase.from("business_value_tags")
          .select("id, entity_type, entity_id, value_band, value_type, estimated_amount, currency, confidence, notes")
          .eq("workspace_id", workspace.id),
      ]);
      if (sErr) throw sErr;
      if (tErr) throw tErr;
      setSignals((sig ?? []) as DeliverySignal[]);
      setTags((tg ?? []) as ValueTag[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load telemetry signals");
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const ingest = useCallback(async () => {
    if (!workspace?.id) {
      setError("Ingestion bypassed: No active workspace target initialized.");
      return;
    }

    setIngesting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication failure: Not signed in");
      
      const { error: fnErr } = await supabase.functions.invoke("ingest-delivery-signals", { 
        body: { workspaceId: workspace.id } 
      });
      
      if (fnErr) throw new Error(fnErr.message);
      
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingestion routine execution failure");
    } finally {
      setIngesting(false);
    }
  }, [load, workspace?.id]);

  const simulate = useCallback(async (params: { teamDelta: number; scopeDeltaPct: number; deferEpicId?: string | null }): Promise<Simulation | null> => {
    if (!workspace?.id) return null;
    const { data, error: fnErr } = await supabase.functions.invoke("simulate-decisions", {
      body: { workspaceId: workspace.id, ...params },
    });
    if (fnErr) throw new Error(fnErr.message);
    if ((data as any)?.error) throw new Error(typeof (data as any).error === "string" ? (data as any).error : "Simulation runtime failure");
    return data as Simulation;
  }, [workspace?.id]);

  useEffect(() => { 
    if (workspace?.id) {
      load(); 
    } 
  }, [workspace?.id, load]);

  return { workspace, signals, tags, loading: loading || wsLoading, ingesting, error, ingest, simulate, refresh: load };
}