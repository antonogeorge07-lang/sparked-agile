import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schemas
const uuidSchema = z.string().uuid();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");

const taskCreateSchema = z.object({
  project_id: uuidSchema,
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
  description: z.string().max(5000, "Description must be less than 5000 characters").optional().nullable(),
  status: z.enum(["To-Do", "In Progress", "Review", "Done"]).optional().default("To-Do"),
  stage: z.enum(["initiation", "planning", "execution", "monitoring", "closing"]).optional().default("initiation"),
  due_date: dateSchema.optional().nullable(),
  start_date: dateSchema.optional().nullable(),
  owner: z.string().max(100, "Owner must be less than 100 characters").optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional().nullable(),
  dependencies: z.array(uuidSchema).optional().nullable(),
});

const taskUpdateSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["To-Do", "In Progress", "Review", "Done"]).optional(),
  stage: z.enum(["initiation", "planning", "execution", "monitoring", "closing"]).optional(),
  due_date: dateSchema.optional().nullable(),
  start_date: dateSchema.optional().nullable(),
  owner: z.string().max(100).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  dependencies: z.array(uuidSchema).optional().nullable(),
  position: z.number().int().min(0).optional(),
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

    console.log(`API /tasks called by user ${user.id}, method: ${req.method}`);

    if (req.method === "GET") {
      const url = new URL(req.url);
      const projectId = url.searchParams.get("project_id");

      // Validate project_id if provided
      if (projectId) {
        const uuidResult = uuidSchema.safeParse(projectId);
        if (!uuidResult.success) {
          return new Response(
            JSON.stringify({ error: "Invalid project_id format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      let query = supabase
        .from("project_tasks")
        .select("*")
        .order("position", { ascending: true });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data: tasks, error } = await query;

      if (error) {
        console.error("Error fetching tasks:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ data: tasks, count: tasks?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      const validation = taskCreateSchema.safeParse(body);
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return new Response(
          JSON.stringify(formatValidationError(validation.error)),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { project_id, title, description, status, stage, due_date, start_date, owner, progress, notes, dependencies } = validation.data;

      // Get max position for the project
      const { data: maxPos } = await supabase
        .from("project_tasks")
        .select("position")
        .eq("project_id", project_id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const newPosition = (maxPos?.position || 0) + 1;

      const { data: task, error } = await supabase
        .from("project_tasks")
        .insert({
          project_id,
          title,
          description: description || null,
          status: status || "To-Do",
          stage: stage || "initiation",
          due_date: due_date || null,
          start_date: start_date || null,
          owner: owner || null,
          progress: progress || null,
          notes: notes || null,
          dependencies: dependencies || null,
          position: newPosition,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Task created: ${task.id}`);
      return new Response(
        JSON.stringify({ data: task }),
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
      const validation = taskUpdateSchema.safeParse(body);
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return new Response(
          JSON.stringify(formatValidationError(validation.error)),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { id, ...updates } = validation.data;

      const { data: task, error } = await supabase
        .from("project_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating task:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Task updated: ${task.id}`);
      return new Response(
        JSON.stringify({ data: task }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "Task id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate UUID format
      const uuidResult = uuidSchema.safeParse(id);
      if (!uuidResult.success) {
        return new Response(
          JSON.stringify({ error: "Invalid task ID format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("project_tasks")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting task:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Task deleted: ${id}`);
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
