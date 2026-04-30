import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ghCorsHeaders, ghFetch, isGhError, resolveGithubContext } from "../_shared/github.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: ghCorsHeaders });

  try {
    const body = await req.json();
    const ctx = await resolveGithubContext(req, body, "fetch-github-issues");
    if (isGhError(ctx)) {
      return new Response(
        JSON.stringify({ error: ctx.error, needsToken: ctx.soft === true, issues: [] }),
        { headers: { ...ghCorsHeaders, "Content-Type": "application/json" }, status: ctx.soft ? 200 : 400 },
      );
    }

    const ghResponse = await ghFetch(
      ctx.token,
      `/repos/${ctx.owner}/${ctx.repo}/issues?state=open&per_page=100`,
    );
    if (!ghResponse.ok) throw new Error(`Failed to fetch GitHub issues: ${ghResponse.status}`);

    const issues = await ghResponse.json();
    const formattedIssues = issues
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        id: issue.number,
        title: issue.title,
        description: issue.body || "",
        status: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        assignee: issue.assignee?.login || null,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      }));

    return new Response(
      JSON.stringify({ success: true, issues: formattedIssues, totalCount: formattedIssues.length }),
      { headers: { ...ghCorsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Error in fetch-github-issues:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", issues: [] }),
      { headers: { ...ghCorsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
