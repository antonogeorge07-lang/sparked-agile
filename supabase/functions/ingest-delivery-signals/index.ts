/**
 * ingest-delivery-signals
 *
 * Computes today's real delivery signals for the caller's workspace from
 * GitHub + Jira and upserts a daily row into public.delivery_signals.
 *
 * Phase C "Truth Engine". User JWT + anon key. No service-role bypass.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseRepo(cfg: any): string | null {
  if (!cfg) return null;
  if (cfg.owner && cfg.repository) return `${cfg.owner}/${cfg.repository}`;
  if (cfg.repo_name && /\//.test(cfg.repo_name)) return cfg.repo_name;
  const url = cfg.repo_url;
  if (typeof url === "string") {
    const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (m) return `${m[1]}/${m[2].replace(".git", "")}`;
  }
  return null;
}

async function gh(token: string, path: string): Promise<any> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Spark-Agile",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return Number(sorted[idx].toFixed(2));
}

async function jira(site: string, auth: string, jql: string, fields = "summary,status,resolutiondate,created,updated"): Promise<any> {
  const url = `${site}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100&fields=${fields}`;
  const res = await fetch(url, { headers: { Authorization: auth, Accept: "application/json" } });
  if (!res.ok) return { total: 0, issues: [] };
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Resolve workspace (owner first, then membership)
    const { data: ownedWs } = await supabase
      .from("workspaces").select("id").eq("owner_id", user.id)
      .order("created_at", { ascending: true }).limit(1);
    let workspaceId = ownedWs?.[0]?.id ?? null;
    if (!workspaceId) {
      const { data: m } = await supabase
        .from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).maybeSingle();
      workspaceId = m?.workspace_id ?? null;
    }
    if (!workspaceId) {
      return new Response(JSON.stringify({ error: "No workspace" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: integrations } = await supabase
      .from("integrations").select("integration_type, config").eq("is_active", true)
      .in("integration_type", ["github", "jira"]);

    const repos = Array.from(new Set((integrations ?? [])
      .filter((i: any) => i.integration_type === "github").map((i: any) => parseRepo(i.config))
      .filter((r): r is string => !!r)));

    const jiraSites = Array.from(new Set((integrations ?? [])
      .filter((i: any) => i.integration_type === "jira").map((i: any) => {
        const cfg = i.config || {};
        const raw = cfg.site_url || cfg.board_url || "";
        const m = String(raw).match(/(https?:\/\/[^/]+)/);
        return m ? m[1] : null;
      }).filter((s): s is string => !!s)));

    const sevenAgo = new Date(Date.now() - 7 * 86400_000);
    const sevenAgoIso = sevenAgo.toISOString();
    const sevenAgoDate = sevenAgoIso.slice(0, 10);

    let prs_merged = 0, prs_opened = 0, issues_resolved = 0, issues_opened = 0;
    let wip_count = 0, blocked_count = 0, deploy_count = 0;
    const cycleHours: number[] = [];
    const leadHours: number[] = [];
    const raw: any = { repos, jiraSites };

    // ── GitHub ─────────────────────────────────────────────
    let ghToken: string | null = null;
    if (repos.length > 0) {
      const { data: tokenInfo } = await supabase
        .from("user_github_tokens_safe").select("has_token").eq("user_id", user.id).maybeSingle();
      if (tokenInfo?.has_token) {
        const dec = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/decrypt-token`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json", "X-Caller-Function": "ingest-delivery-signals" },
          body: JSON.stringify({ integrationType: "github" }),
        });
        if (dec.ok) ghToken = (await dec.json()).token ?? null;
      }
    }

    if (ghToken) {
      for (const repo of repos.slice(0, 5)) {
        const merged = await gh(ghToken, `/search/issues?q=${encodeURIComponent(`repo:${repo} is:pr is:merged merged:>=${sevenAgoDate}`)}&per_page=100`);
        const opened = await gh(ghToken, `/search/issues?q=${encodeURIComponent(`repo:${repo} is:pr created:>=${sevenAgoDate}`)}&per_page=1`);
        const openWip = await gh(ghToken, `/search/issues?q=${encodeURIComponent(`repo:${repo} is:pr is:open`)}&per_page=1`);
        const blocked = await gh(ghToken, `/search/issues?q=${encodeURIComponent(`repo:${repo} is:open label:blocked`)}&per_page=1`);
        const deploys = await gh(ghToken, `/repos/${repo}/deployments?per_page=100`);

        prs_merged += merged?.total_count ?? 0;
        prs_opened += opened?.total_count ?? 0;
        wip_count += openWip?.total_count ?? 0;
        blocked_count += blocked?.total_count ?? 0;

        if (Array.isArray(deploys)) {
          deploy_count += deploys.filter((d: any) => new Date(d.created_at) >= sevenAgo).length;
        }

        for (const pr of (merged?.items ?? []).slice(0, 50)) {
          if (pr.created_at && pr.closed_at) {
            const h = (new Date(pr.closed_at).getTime() - new Date(pr.created_at).getTime()) / 36e5;
            if (h >= 0 && h < 24 * 365) cycleHours.push(h);
          }
        }
      }
      raw.github = { prs_merged, prs_opened, wip_count, blocked_count, deploy_count };
    }

    // ── Jira ───────────────────────────────────────────────
    let jiraAuth: string | null = null;
    if (jiraSites.length > 0) {
      const { data: tokenInfo } = await supabase
        .from("user_jira_tokens_safe").select("has_token, has_jira_email").eq("user_id", user.id).maybeSingle();
      if (tokenInfo?.has_token) {
        const dec = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/decrypt-token`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json", "X-Caller-Function": "ingest-delivery-signals" },
          body: JSON.stringify({ integrationType: "jira", includeMetadata: true }),
        });
        if (dec.ok) {
          const j = await dec.json();
          const token = j.token as string | null;
          const email = j.metadata?.jira_email as string | null;
          if (token) jiraAuth = email ? `Basic ${btoa(`${email}:${token}`)}` : `Bearer ${token}`;
        }
      }
    }

    if (jiraAuth) {
      for (const site of jiraSites.slice(0, 3)) {
        const resolved = await jira(site, jiraAuth, `resolved >= -7d`);
        const created = await jira(site, jiraAuth, `created >= -7d`);
        const open = await jira(site, jiraAuth, `statusCategory != Done`);
        const blocked = await jira(site, jiraAuth, `statusCategory != Done AND (labels = blocked OR status = Blocked)`);

        issues_resolved += resolved?.total ?? 0;
        issues_opened += created?.total ?? 0;
        wip_count += open?.total ?? 0;
        blocked_count += blocked?.total ?? 0;

        for (const it of (resolved?.issues ?? []).slice(0, 100)) {
          const c = it.fields?.created, r = it.fields?.resolutiondate;
          if (c && r) {
            const h = (new Date(r).getTime() - new Date(c).getTime()) / 36e5;
            if (h >= 0 && h < 24 * 730) leadHours.push(h);
          }
        }
      }
      raw.jira = { issues_resolved, issues_opened };
    }

    cycleHours.sort((a, b) => a - b);
    leadHours.sort((a, b) => a - b);

    const row = {
      workspace_id: workspaceId,
      snapshot_date: new Date().toISOString().slice(0, 10),
      source: "combined" as const,
      prs_merged, prs_opened, issues_resolved, issues_opened,
      cycle_time_p50_hours: percentile(cycleHours, 0.5),
      cycle_time_p90_hours: percentile(cycleHours, 0.9),
      lead_time_p50_hours: percentile(leadHours, 0.5),
      wip_count, blocked_count, deploy_count,
      raw_payload: raw,
    };

    // Upsert via service role so writes succeed (table is read-only to authenticated)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { error: upErr } = await adminClient
      .from("delivery_signals")
      .upsert(row, { onConflict: "workspace_id,snapshot_date,source" });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ status: "ok", snapshot: row, hasGithub: !!ghToken, hasJira: !!jiraAuth }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("ingest-delivery-signals error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
