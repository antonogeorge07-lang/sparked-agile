/**
 * generate-briefing
 *
 * Phase B "first-60-seconds" briefing aggregated across the authenticated
 * user's GitHub AND Jira integrations. Each surfaced item is tagged with its
 * source so the UI can mix them in one list.
 *
 * No service-role bypass. User JWT + anon key only.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BriefItem {
  source: "github" | "jira";
  key: string;          // PR#42 or PROJ-123
  title: string;
  author: string;
  url: string;
  context: string;      // repo or jira site
  updatedAt: string;
}

interface Bucket {
  count: number;
  items: BriefItem[];
}

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

async function ghSearch(token: string, q: string): Promise<any> {
  const res = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=5&sort=updated&order=desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Spark-Agile",
      },
    },
  );
  if (!res.ok) return { total_count: 0, items: [] };
  return res.json();
}

function ghItems(json: any, repo: string): BriefItem[] {
  return (json.items ?? []).slice(0, 5).map((it: any) => ({
    source: "github" as const,
    key: `#${it.number}`,
    title: it.title,
    author: it.user?.login ?? "unknown",
    url: it.html_url,
    context: repo,
    updatedAt: it.updated_at,
  }));
}

async function jiraSearch(
  site: string,
  authHeader: string,
  jql: string,
): Promise<any> {
  const url = `${site}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=5&fields=summary,status,assignee,updated`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader, Accept: "application/json" },
  });
  if (!res.ok) return { total: 0, issues: [] };
  return res.json();
}

function jiraItems(json: any, site: string): BriefItem[] {
  return (json.issues ?? []).slice(0, 5).map((it: any) => ({
    source: "jira" as const,
    key: it.key,
    title: it.fields?.summary ?? it.key,
    author: it.fields?.assignee?.displayName ?? "Unassigned",
    url: `${site}/browse/${it.key}`,
    context: site.replace(/^https?:\/\//, ""),
    updatedAt: it.fields?.updated ?? new Date().toISOString(),
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load active integrations the user can see (RLS-scoped).
    const { data: integrations } = await supabase
      .from("integrations")
      .select("integration_type, config")
      .eq("is_active", true)
      .in("integration_type", ["github", "jira"]);

    const repos = Array.from(
      new Set(
        (integrations ?? [])
          .filter((i: any) => i.integration_type === "github")
          .map((i: any) => parseRepo(i.config))
          .filter((r): r is string => !!r),
      ),
    );

    const jiraSites = Array.from(
      new Set(
        (integrations ?? [])
          .filter((i: any) => i.integration_type === "jira")
          .map((i: any) => {
            const cfg = i.config || {};
            const raw = cfg.site_url || cfg.board_url || "";
            const m = String(raw).match(/(https?:\/\/[^/]+)/);
            return m ? m[1] : null;
          })
          .filter((s): s is string => !!s),
      ),
    );

    const sevenAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
    const threeAgo = new Date(Date.now() - 3 * 86400_000).toISOString().slice(0, 10);

    const shipped: Bucket = { count: 0, items: [] };
    const stuck: Bucket = { count: 0, items: [] };
    const decide: Bucket = { count: 0, items: [] };

    // ── GitHub ─────────────────────────────────────────────
    let ghToken: string | null = null;
    if (repos.length > 0) {
      const { data: tokenInfo } = await supabase
        .from("user_github_tokens_safe")
        .select("has_token")
        .eq("user_id", user.id)
        .maybeSingle();

      if (tokenInfo?.has_token) {
        const dec = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/decrypt-token`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
              "X-Caller-Function": "generate-briefing",
            },
            body: JSON.stringify({ integrationType: "github" }),
          },
        );
        if (dec.ok) {
          const j = await dec.json();
          ghToken = j.token ?? null;
        }
      }

      if (ghToken) {
        for (const repo of repos.slice(0, 5)) {
          const [s, k, d] = await Promise.all([
            ghSearch(ghToken, `repo:${repo} is:pr is:merged merged:>=${sevenAgo}`),
            ghSearch(ghToken, `repo:${repo} is:pr is:open updated:<${threeAgo}`),
            ghSearch(ghToken, `repo:${repo} is:pr is:open review:required`),
          ]);
          shipped.count += s.total_count ?? 0;
          stuck.count += k.total_count ?? 0;
          decide.count += d.total_count ?? 0;
          shipped.items.push(...ghItems(s, repo));
          stuck.items.push(...ghItems(k, repo));
          decide.items.push(...ghItems(d, repo));
        }
      }
    }

    // ── Jira ───────────────────────────────────────────────
    let jiraAuthHeader: string | null = null;
    let jiraTokenSite: string | null = null;
    if (jiraSites.length > 0) {
      const { data: tokenInfo } = await supabase
        .from("user_jira_tokens_safe")
        .select("has_token, has_jira_email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (tokenInfo?.has_token) {
        const dec = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/decrypt-token`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
              "X-Caller-Function": "generate-briefing",
            },
            body: JSON.stringify({ integrationType: "jira", includeMetadata: true }),
          },
        );
        if (dec.ok) {
          const j = await dec.json();
          const token = j.token as string | null;
          const email = j.metadata?.jira_email as string | null;
          jiraTokenSite = j.metadata?.jira_site_url ?? null;
          if (token) {
            jiraAuthHeader = email
              ? `Basic ${btoa(`${email}:${token}`)}`
              : `Bearer ${token}`;
          }
        }
      }

      if (jiraAuthHeader) {
        const targetSites = jiraTokenSite
          ? [jiraTokenSite, ...jiraSites.filter((s) => s !== jiraTokenSite)].slice(0, 3)
          : jiraSites.slice(0, 3);

        for (const site of targetSites) {
          const [s, k, d] = await Promise.all([
            jiraSearch(site, jiraAuthHeader, `resolved >= -7d`),
            jiraSearch(
              site,
              jiraAuthHeader,
              `statusCategory != Done AND updated <= -3d`,
            ),
            jiraSearch(site, jiraAuthHeader, `status = "In Review"`),
          ]);
          shipped.count += s.total ?? 0;
          stuck.count += k.total ?? 0;
          decide.count += d.total ?? 0;
          shipped.items.push(...jiraItems(s, site));
          stuck.items.push(...jiraItems(k, site));
          decide.items.push(...jiraItems(d, site));
        }
      }
    }

    const noGithub = repos.length === 0;
    const noJira = jiraSites.length === 0;

    let status: "ok" | "no_integration" | "no_token";
    if (noGithub && noJira) status = "no_integration";
    else if (!ghToken && !jiraAuthHeader) status = "no_token";
    else status = "ok";

    const trim = (xs: BriefItem[]) =>
      xs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 5);

    return new Response(
      JSON.stringify({
        status,
        repos,
        jiraSites,
        shipped: { count: shipped.count, items: trim(shipped.items) },
        stuck: { count: stuck.count, items: trim(stuck.items) },
        decide: { count: decide.count, items: trim(decide.items) },
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("generate-briefing error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
