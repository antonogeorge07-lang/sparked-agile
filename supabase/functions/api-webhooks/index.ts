import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    console.log(`API /webhooks called by user ${user.id}, method: ${req.method}`);

    if (req.method === "GET") {
      const url = new URL(req.url);
      const includeDeliveries = url.searchParams.get("include_deliveries") === "true";

      let query = supabase
        .from("webhooks")
        .select(includeDeliveries ? `
          id,
          project_id,
          url,
          events,
          is_active,
          created_at,
          updated_at,
          webhook_deliveries(
            id,
            event_type,
            status,
            response_status,
            attempt_count,
            created_at,
            delivered_at
          )
        ` : `
          id,
          project_id,
          url,
          events,
          is_active,
          created_at,
          updated_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: webhooks, error } = await query;

      if (error) {
        console.error("Error fetching webhooks:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ data: webhooks, count: webhooks?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { url, events, project_id, secret } = body;

      if (!url || !events || !Array.isArray(events) || events.length === 0) {
        return new Response(
          JSON.stringify({ error: "url and events array are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate events
      const validEvents = [
        "projects.insert", "projects.update", "projects.delete",
        "project_tasks.insert", "project_tasks.update", "project_tasks.delete",
        "epics.insert", "epics.update", "epics.delete"
      ];
      
      const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: `Invalid events: ${invalidEvents.join(", ")}. Valid events are: ${validEvents.join(", ")}` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: webhook, error } = await supabase
        .from("webhooks")
        .insert({
          url,
          events,
          project_id: project_id || null,
          secret: secret || null,
          user_id: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating webhook:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Webhook created: ${webhook.id}`);
      return new Response(
        JSON.stringify({ data: { ...webhook, secret: undefined } }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Webhook id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Only allow updating specific fields
      const safeUpdates: any = {};
      if (updates.url !== undefined) safeUpdates.url = updates.url;
      if (updates.events !== undefined) safeUpdates.events = updates.events;
      if (updates.is_active !== undefined) safeUpdates.is_active = updates.is_active;
      if (updates.secret !== undefined) safeUpdates.secret = updates.secret;

      const { data: webhook, error } = await supabase
        .from("webhooks")
        .update(safeUpdates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating webhook:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Webhook updated: ${webhook.id}`);
      return new Response(
        JSON.stringify({ data: { ...webhook, secret: undefined } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Webhook id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting webhook:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Webhook deleted: ${id}`);
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
