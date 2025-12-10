import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`API /integrations called by user ${user.id}, method: ${req.method}`);

    if (req.method === "GET") {
      const url = new URL(req.url);
      const projectId = url.searchParams.get("project_id");

      let query = supabase
        .from("integrations")
        .select(`
          id,
          project_id,
          integration_type,
          name,
          is_active,
          created_at,
          updated_at
        `);

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data: integrations, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching integrations:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ data: integrations, count: integrations?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { project_id, integration_type, name, config } = body;

      if (!project_id || !integration_type || !name) {
        return new Response(
          JSON.stringify({ error: "project_id, integration_type, and name are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: integration, error } = await supabase
        .from("integrations")
        .insert({
          project_id,
          integration_type,
          name,
          config: config || {},
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating integration:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Integration created: ${integration.id}`);
      return new Response(
        JSON.stringify({ data: integration }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Integration id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Remove config from safe updates to prevent exposing secrets
      const safeUpdates: any = {};
      if (updates.name !== undefined) safeUpdates.name = updates.name;
      if (updates.is_active !== undefined) safeUpdates.is_active = updates.is_active;
      if (updates.config !== undefined) safeUpdates.config = updates.config;

      const { data: integration, error } = await supabase
        .from("integrations")
        .update(safeUpdates)
        .eq("id", id)
        .select(`
          id,
          project_id,
          integration_type,
          name,
          is_active,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error("Error updating integration:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Integration updated: ${integration.id}`);
      return new Response(
        JSON.stringify({ data: integration }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Integration id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting integration:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Integration deleted: ${id}`);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
