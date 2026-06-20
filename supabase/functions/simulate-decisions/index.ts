/**
 * simulate-decisions
 *
 * Decision simulator. Reads the caller's workspace's last 12 weeks of
 * delivery_signals + business_value_tags, and projects the impact of
 * scenario changes (team size delta, scope delta, deferred epic).
 *
 * Honest model based on the team's OWN historical signals, no generic
 * industry benchmarks. Phase C "Truth Engine".
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  workspaceId: z.string().uuid(),
  teamDelta: z.number().int().min(-20).max(20).default(0),
  scopeDeltaPct: z.number().min(-100).max(200).default(0),
  deferEpicId: z.string().uuid().optional().nullable(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { workspaceId, teamDelta, scopeDeltaPct, deferEpicId } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify workspace membership (also enforced by RLS but explicit is clearer)
    const { data: membership } = await supabase
      .from("workspace_members").select("user_id").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Last 12 weeks of signals
    const twelveWeeks = new Date(Date.now() - 84 * 86400_000).toISOString().slice(0, 10);
    const { data: signals, error: sErr } = await supabase
      .from("delivery_signals")
      .select("snapshot_date, prs_merged, issues_resolved, cycle_time_p50_hours, lead_time_p50_hours, wip_count, deploy_count, blocked_count")
      .eq("workspace_id", workspaceId)
      .gte("snapshot_date", twelveWeeks)
      .order("snapshot_date", { ascending: false })
      .limit(84);
    if (sErr) throw sErr;

    // Current team size from workspace_members
    const { count: teamCount } = await supabase
      .from("workspace_members").select("user_id", { count: "exact", head: true }).eq("workspace_id", workspaceId);

    const currentTeam = teamCount ?? 1;
    const newTeam = Math.max(1, currentTeam + teamDelta);

    // Baseline throughput per snapshot window (7-day deliveries per snapshot)
    const throughputs = (signals ?? []).map(s => (s.prs_merged ?? 0) + (s.issues_resolved ?? 0));
    const baselineThroughput = throughputs.length
      ? throughputs.reduce((a, b) => a + b, 0) / throughputs.length
      : 0;

    const leadTimes = (signals ?? []).map(s => Number(s.lead_time_p50_hours ?? 0)).filter(x => x > 0);
    const baselineLeadHours = leadTimes.length ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0;

    // Brooks-style honest scaling (not linear):
    // Throughput scales with sqrt(team ratio); lead time scales with 1/sqrt + scope factor.
    const teamRatio = newTeam / currentTeam;
    const throughputMultiplier = Math.sqrt(teamRatio);
    const scopeMultiplier = 1 + scopeDeltaPct / 100;

    const projectedThroughput = baselineThroughput * throughputMultiplier / Math.max(0.01, scopeMultiplier);
    const projectedLeadHours = baselineLeadHours
      ? (baselineLeadHours / Math.sqrt(teamRatio)) * Math.max(0.5, scopeMultiplier)
      : 0;

    // Value impact: sum value tags for active epics, optionally subtract deferred epic
    const { data: tags } = await supabase
      .from("business_value_tags")
      .select("entity_id, value_band, value_type, estimated_amount, currency, confidence")
      .eq("workspace_id", workspaceId)
      .eq("entity_type", "epic");

    const bandWeight = { high: 3, medium: 2, low: 1 } as const;
    let totalValueScore = 0, totalMonetary = 0;
    let deferredValueScore = 0, deferredMonetary = 0;

    for (const t of tags ?? []) {
      const w = bandWeight[t.value_band as keyof typeof bandWeight] ?? 0;
      const amt = Number(t.estimated_amount ?? 0);
      totalValueScore += w;
      totalMonetary += amt;
      if (deferEpicId && t.entity_id === deferEpicId) {
        deferredValueScore += w;
        deferredMonetary += amt;
      }
    }

    const valueRetainedPct = totalValueScore > 0
      ? Math.round(((totalValueScore - deferredValueScore) / totalValueScore) * 100)
      : 100;

    // Confidence based on data volume
    const dataPoints = signals?.length ?? 0;
    const confidence = dataPoints >= 30 ? "high" : dataPoints >= 10 ? "medium" : "low";

    // Plain English insight
    const throughputChangePct = baselineThroughput > 0
      ? Math.round(((projectedThroughput - baselineThroughput) / baselineThroughput) * 100)
      : 0;
    const leadChangePct = baselineLeadHours > 0
      ? Math.round(((projectedLeadHours - baselineLeadHours) / baselineLeadHours) * 100)
      : 0;

    const insight =
      `Based on your last ${dataPoints} daily snapshots, this scenario projects ` +
      `throughput at ${projectedThroughput.toFixed(1)} items/week ` +
      `(${throughputChangePct >= 0 ? "+" : ""}${throughputChangePct}% vs baseline) ` +
      `and lead time around ${(projectedLeadHours / 24).toFixed(1)} days ` +
      `(${leadChangePct >= 0 ? "+" : ""}${leadChangePct}%). ` +
      (deferEpicId
        ? `Deferring the selected epic preserves ${valueRetainedPct}% of tagged business value.`
        : `${valueRetainedPct}% of tagged business value remains in scope.`);

    return new Response(JSON.stringify({
      status: "ok",
      confidence,
      baseline: {
        teamSize: currentTeam,
        weeklyThroughput: Number(baselineThroughput.toFixed(2)),
        leadTimeDays: Number((baselineLeadHours / 24).toFixed(2)),
        dataPoints,
      },
      projection: {
        teamSize: newTeam,
        weeklyThroughput: Number(projectedThroughput.toFixed(2)),
        leadTimeDays: Number((projectedLeadHours / 24).toFixed(2)),
        throughputChangePct,
        leadChangePct,
      },
      value: {
        totalScore: totalValueScore,
        totalMonetary,
        deferredScore: deferredValueScore,
        deferredMonetary,
        valueRetainedPct,
      },
      insight,
      generatedAt: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("simulate-decisions error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
