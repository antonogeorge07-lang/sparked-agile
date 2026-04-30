/**
 * Shared helpers for GitHub fetch edge functions.
 * Extracts auth + token resolution + repo parsing previously copy-pasted
 * across fetch-github-issues, fetch-github-prs, fetch-github-activity.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveIntegrationConfig } from "./integration-resolver.ts";

export const ghCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export interface GhContext {
  client: ReturnType<typeof createClient>;
  user: { id: string };
  token: string;
  owner: string;
  repo: string;
}

/**
 * Resolves the user, GitHub token (encrypted user token preferred, env fallback),
 * and the repo coordinates from the project's integration config.
 * Returns null if anything is missing; caller should respond with a soft empty payload.
 */
export async function resolveGithubContext(
  req: Request,
  body: { projectId?: string; workspaceId?: string },
  callerName: string,
): Promise<GhContext | { error: string; soft?: boolean }> {
  const client = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
  );

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: "User not authenticated" };

  const { data: userTokenInfo } = await client
    .from("user_github_tokens_safe")
    .select("has_token")
    .eq("user_id", user.id)
    .maybeSingle();

  let token: string | null = null;
  if (userTokenInfo?.has_token) {
    const decryptResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/decrypt-token`,
      {
        method: "POST",
        headers: {
          Authorization: req.headers.get("Authorization")!,
          "Content-Type": "application/json",
          "X-Caller-Function": callerName,
        },
        body: JSON.stringify({ integrationType: "github" }),
      },
    );
    if (decryptResponse.ok) {
      const decryptedData = await decryptResponse.json();
      token = decryptedData.token;
    }
  }

  if (!token) token = Deno.env.get("GITHUB_TOKEN") ?? null;
  if (!token) return { error: "GitHub not connected", soft: true };

  const githubConfig = await resolveIntegrationConfig(client, "github", body);
  if (!githubConfig) return { error: "GitHub not configured for this project" };

  const repoUrl = githubConfig.config?.repo_url;
  const repoName = githubConfig.config?.repo_name;

  let owner = "", repo = "";
  if (repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) { owner = match[1]; repo = match[2].replace(".git", ""); }
  } else if (repoName) {
    const parts = repoName.split("/");
    if (parts.length === 2) { owner = parts[0]; repo = parts[1]; }
  }
  if (!owner || !repo) return { error: "Invalid GitHub repository configuration" };

  return { client, user: { id: user.id }, token, owner, repo };
}

export function ghFetch(token: string, path: string) {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Spark-Agile",
    },
  });
}

export function isGhError(
  ctx: GhContext | { error: string; soft?: boolean },
): ctx is { error: string; soft?: boolean } {
  return (ctx as any).error !== undefined;
}
