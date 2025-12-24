import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");

const epicCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
  description: z.string().max(5000, "Description must be less than 5000 characters").optional().nullable(),
  value_stream_id: uuidSchema.optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  start_date: dateSchema.optional().nullable(),
  end_date: dateSchema.optional().nullable(),
  business_value: z.number().int().min(0).max(100).optional().nullable(),
});

const epicUpdateSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  value_stream_id: uuidSchema.optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["draft", "in_progress", "completed", "cancelled"]).optional(),
  start_date: dateSchema.optional().nullable(),
  end_date: dateSchema.optional().nullable(),
  business_value: z.number().int().min(0).max(100).optional().nullable(),
  health_score: z.enum(["on_track", "at_risk", "critical"]).optional(),
  target_velocity: z.number().min(0).optional().nullable(),
  current_velocity: z.number().min(0).optional().nullable(),
  acceptance_criteria: z.array(z.string().max(500)).optional().nullable(),
  strategic_goals: z.array(z.string().max(500)).optional().nullable(),
  responsible_teams: z.array(z.string().max(100)).optional().nullable(),
  business_justification: z.string().max(2000).optional().nullable(),
});

function formatValidationError(error: z.ZodError) {
  return {
    error: "Validation failed",
    details: error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message
    }))
  };
}

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
        // Validate UUID format
        const uuidResult = uuidSchema.safeParse(epicId);
        if (!uuidResult.success) {
          return new Response(
            JSON.stringify({ error: "Invalid epic ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

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
      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate input
      const validation = epicCreateSchema.safeParse(body);
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return new Response(
          JSON.stringify(formatValidationError(validation.error)),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { title, description, value_stream_id, priority, start_date, end_date, business_value } = validation.data;

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
      let body;
      try {
        body = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate input
      const validation = epicUpdateSchema.safeParse(body);
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return new Response(
          JSON.stringify(formatValidationError(validation.error)),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { id, ...updates } = validation.data;
      const targetId = id || epicId;

      if (!targetId || targetId === "api-epics") {
        return new Response(
          JSON.stringify({ error: "Epic id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate UUID format
      const uuidResult = uuidSchema.safeParse(targetId);
      if (!uuidResult.success) {
        return new Response(
          JSON.stringify({ error: "Invalid epic ID format" }),
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
