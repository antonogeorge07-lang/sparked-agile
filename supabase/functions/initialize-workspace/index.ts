// Initialize workspace stub.
// The legacy project_workspaces / ceremony_configs tables have been removed.
// Workspace concept is now equivalent to a Project; ceremony scheduling is
// handled separately via /ceremony-setup. This function is kept for backward
// compatibility with the existing UI and returns a synthesized response.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json().catch(() => ({}));
    const { projectId, workspaceName } = body;

    if (!projectId) throw new Error("projectId is required");

    // Verify the user can see the project (RLS enforces project membership)
    const { data: project } = await supabaseClient
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) throw new Error("Project not found or access denied");

    return new Response(
      JSON.stringify({
        success: true,
        workspace: {
          id: project.id,
          project_id: project.id,
          name: workspaceName || project.name,
          configuration_status: "ready",
        },
        createdCeremonies: [],
        message:
          "Workspace ready. Use /ceremony-setup to configure recurring ceremonies.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
