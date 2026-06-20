import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

// Verify GitHub HMAC-SHA256 signature
async function verifyGithubSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const provided = signatureHeader.slice("sha256=".length);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const githubSecret = Deno.env.get("GITHUB_WEBHOOK_SECRET");
    const authHeader = req.headers.get("Authorization");
    const isServiceRole =
      !!serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`;

    const rawBody = await req.text();

    // Require either service-role auth or a valid GitHub HMAC signature
    let authorized = isServiceRole;
    if (!authorized && githubSecret) {
      authorized = await verifyGithubSignature(
        rawBody,
        req.headers.get("x-hub-signature-256"),
        githubSecret
      );
    }

    if (!authorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey
    );

    const payload = rawBody ? JSON.parse(rawBody) : {};
    const commitMessage =
      payload.head_commit?.message || "GitHub Telemetry Handshake Active";
    const repoName = payload.repository?.name || "Core Node";

    console.log(`Autonomous Telemetry Logged: ${repoName} -> ${commitMessage}`);

    const { error } = await supabaseClient
      .from("action_items")
      .insert({
        title: `Telemetry: ${repoName}`,
        description: commitMessage,
        priority: commitMessage.toLowerCase().includes("fix") ? "high" : "medium",
        status: "open",
        source_type: repoName,
        source_id: payload.head_commit?.id || "7d6384d",
      })
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Autonomous streamline active." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown structural error state";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
