import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  ghCorsHeaders,
  ghFetch,
  isGhError,
  resolveGithubContext,
} from "../_shared/github.ts";

interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: string;
  draft: boolean;
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
  head: { ref: string };
  base: { ref: string };
  labels: Array<{ name: string }>;
  requested_reviewers: Array<{ login: string }>;
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...ghCorsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: ghCorsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed", pullRequests: [] }, 405);

  try {
    const body = await req.json();
    const ctx = await resolveGithubContext(req, body, "fetch-github-prs");

    if (isGhError(ctx)) {
      return json({
        error: ctx.error,
        needsToken: ctx.soft === true,
        reconnect_required: ctx.reconnect_required === true,
        integration_type: ctx.integration_type || "github",
        message: ctx.message,
        pullRequests: [],
      }, ctx.soft ? 200 : 400);
    }

    const response = await ghFetch(
      ctx.token,
      `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/pulls?state=all&sort=updated&direction=desc&per_page=100`,
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return json({
          error: "TOKEN_INVALID",
          reconnect_required: true,
          integration_type: "github",
          message: "GitHub rejected the saved token. Please reconnect GitHub.",
          pullRequests: [],
        });
      }
      if (response.status === 404) {
        return json({
          error: "REPOSITORY_NOT_FOUND",
          message: "The configured GitHub repository was not found or is not accessible.",
          pullRequests: [],
        }, 400);
      }
      throw new Error(`GitHub pull request fetch failed with status ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("GitHub returned an invalid pull request response");

    const pullRequests = (payload as GitHubPullRequest[]).map((pullRequest) => ({
      number: pullRequest.number,
      title: pullRequest.title,
      body: pullRequest.body || "",
      state: pullRequest.state,
      draft: pullRequest.draft,
      author: pullRequest.user?.login || "unknown",
      authorAvatar: pullRequest.user?.avatar_url || "",
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
      mergedAt: pullRequest.merged_at,
      url: pullRequest.html_url,
      head: pullRequest.head.ref,
      base: pullRequest.base.ref,
      labels: pullRequest.labels.map((label) => label.name),
      reviewers: pullRequest.requested_reviewers.map((reviewer) => reviewer.login),
    }));

    return json({ success: true, pullRequests, totalCount: pullRequests.length });
  } catch (error: unknown) {
    console.error("Error in fetch-github-prs:", error);
    return json({
      error: error instanceof Error ? error.message : "Unknown error",
      pullRequests: [],
    }, 400);
  }
});
