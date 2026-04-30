import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ghCorsHeaders, ghFetch, isGhError, resolveGithubContext } from "../_shared/github.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: ghCorsHeaders });

  try {
    const body = await req.json();
    const state = body.state || "open";
    const ctx = await resolveGithubContext(req, body, "fetch-github-prs");
    if (isGhError(ctx)) {
      return new Response(
        JSON.stringify({ error: ctx.error, needsToken: ctx.soft === true, pullRequests: [] }),
        { headers: { ...ghCorsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const ghResponse = await ghFetch(
      ctx.token,
      `/repos/${ctx.owner}/${ctx.repo}/pulls?state=${state}&per_page=50&sort=updated&direction=desc`,
    );
    if (!ghResponse.ok) throw new Error(`Failed to fetch PRs: ${ghResponse.status}`);

    const prs = await ghResponse.json();
    const formatted = prs.map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      body: pr.body || "",
      state: pr.state,
      draft: pr.draft,
      author: pr.user?.login,
      authorAvatar: pr.user?.avatar_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at,
      url: pr.html_url,
      head: pr.head?.ref,
      base: pr.base?.ref,
      labels: pr.labels?.map((l: any) => l.name) || [],
      reviewers: pr.requested_reviewers?.map((r: any) => r.login) || [],
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
    }));

    return new Response(
      JSON.stringify({ success: true, pullRequests: formatted, totalCount: formatted.length }),
      { headers: { ...ghCorsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Error in fetch-github-prs:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", pullRequests: [] }),
      { headers: { ...ghCorsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
