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

    console.log(`API /epics called by user ${user.id}, method: ${req.method}`);

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const epicId = pathParts[pathParts.length - 1];

    if (req.method === "GET") {
      // Check if getting a specific epic or all epics
      if (epicId && epicId !== "api-epics") {
        // GET /api/epics/:id - Get epic details with features
        const { data: epic, error } = await supabase
          .from("epics")
          .select(`
            *,
            features(
              id,
              title,
              description,
              status,
              priority,
              effort_estimate,
              created_at
            ),
            epic_milestones(
              id,
              title,
              target_date,
              status,
              completion_percentage
            ),
            epic_dependencies(
              id,
              depends_on_epic_id,
              dependency_type,
              status
            ),
            value_streams(
              id,
              name,
              project_id
            )
          `)
          .eq("id", epicId)
          .single();

        if (error) {
          console.error("Error fetching epic:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: error.code === "PGRST116" ? 404 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Calculate progress
        const totalFeatures = epic.features?.length || 0;
        const completedFeatures = epic.features?.filter((f: any) => f.status === "completed").length || 0;
        const progress = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;

        return new Response(
          JSON.stringify({ 
            data: {
              ...epic,
              progress,
              total_features: totalFeatures,
              completed_features: completedFeatures
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // GET /api/epics - Get all epics
        const { data: epics, error } = await supabase
          .from("epics")
          .select(`
            id,
            title,
            description,
            status,
            priority,
            start_date,
            end_date,
            health_score,
            created_at,
            value_streams(id, name, project_id)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching epics:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ data: epics, count: epics?.length || 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { title, description, value_stream_id, priority, start_date, end_date, business_value } = body;

      if (!title) {
        return new Response(
          JSON.stringify({ error: "Epic title is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: epic, error } = await supabase
        .from("epics")
        .insert({
          title,
          description: description || null,
          value_stream_id: value_stream_id || null,
          priority: priority || "medium",
          start_date: start_date || null,
          end_date: end_date || null,
          business_value: business_value || null,
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating epic:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Epic created: ${epic.id}`);
      return new Response(
        JSON.stringify({ data: epic }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await req.json();
      const { id, ...updates } = body;
      const targetId = id || epicId;

      if (!targetId || targetId === "api-epics") {
        return new Response(
          JSON.stringify({ error: "Epic id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: epic, error } = await supabase
        .from("epics")
        .update(updates)
        .eq("id", targetId)
        .select()
        .single();

      if (error) {
        console.error("Error updating epic:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Epic updated: ${epic.id}`);
      return new Response(
        JSON.stringify({ data: epic }),
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
