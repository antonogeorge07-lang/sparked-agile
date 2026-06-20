/**
 * daily-signals-cron
 *
 * System-scheduled job that records a daily delivery_signals row for every
 * workspace using internal Spark-Agile data (features + native backlog items).
 * Authenticated by CRON_SECRET header. Users can still trigger a richer
 * GitHub/Jira ingestion manually from /velocity-truth (which uses their JWT
 * and decrypts their own tokens via decrypt-token).
 *
 * Phase C "Truth Engine" - scheduled baseline.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const provided = req.headers.get("x-cron-secret");
    if (!cronSecret || provided !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const today = new Date().toISOString().slice(0, 10);
    const sevenAgoIso = new Date(Date.now() - 7 * 86400_000).toISOString();

    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id");

    const results: Array<{ workspace_id: string; ok: boolean; error?: string }> = [];

    for (const ws of workspaces ?? []) {
      try {
        // Projects in this workspace
        const { data: projects } = await supabase
          .from("projects").select("id").eq("workspace_id", ws.id);
        const projectIds = (projects ?? []).map((p: any) => p.id);

        let issues_resolved = 0;
        let issues_opened = 0;
        let wip_count = 0;
        let blocked_count = 0;
        const leadHours: number[] = [];

        if (projectIds.length > 0) {
          // Features resolved last 7 days
          const { data: doneFeatures } = await supabase
            .from("features").select("created_at, updated_at, status")
            .in("project_id", projectIds)
            .eq("status", "done")
            .gte("updated_at", sevenAgoIso);
          issues_resolved += (doneFeatures ?? []).length;
          for (const f of doneFeatures ?? []) {
            if (f.created_at && f.updated_at) {
              const h = (new Date(f.updated_at).getTime() - new Date(f.created_at).getTime()) / 36e5;
              if (h >= 0 && h < 24 * 730) leadHours.push(h);
            }
          }

          // Opened last 7 days
          const { count: opened } = await supabase
            .from("features").select("id", { count: "exact", head: true })
            .in("project_id", projectIds)
            .gte("created_at", sevenAgoIso);
          issues_opened += opened ?? 0;

          // WIP
          const { count: wip } = await supabase
            .from("features").select("id", { count: "exact", head: true })
            .in("project_id", projectIds)
            .in("status", ["in_progress", "in-progress", "doing"]);
          wip_count += wip ?? 0;

          // Blocked
          const { count: blocked } = await supabase
            .from("features").select("id", { count: "exact", head: true })
            .in("project_id", projectIds)
            .in("status", ["blocked", "on_hold"]);
          blocked_count += blocked ?? 0;
        }

        leadHours.sort((a, b) => a - b);
        const p = (arr: number[], q: number) =>
          arr.length === 0 ? null : Number(arr[Math.min(arr.length - 1, Math.floor((arr.length - 1) * q))].toFixed(2));

        const row = {
          workspace_id: ws.id,
          snapshot_date: today,
          source: "system" as const,
          prs_merged: 0,
          prs_opened: 0,
          issues_resolved,
          issues_opened,
          cycle_time_p50_hours: null,
          cycle_time_p90_hours: null,
          lead_time_p50_hours: p(leadHours, 0.5),
          wip_count,
          blocked_count,
          deploy_count: 0,
          raw_payload: { generated_by: "daily-signals-cron", project_count: projectIds.length },
        };

        const { error } = await supabase
          .from("delivery_signals")
          .upsert(row, { onConflict: "workspace_id,snapshot_date,source" });

        if (error) throw error;
        results.push({ workspace_id: ws.id, ok: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error(`workspace ${ws.id} failed:`, msg);
        results.push({ workspace_id: ws.id, ok: false, error: msg });
      }
    }

    return new Response(
      JSON.stringify({ status: "ok", processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("daily-signals-cron error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
