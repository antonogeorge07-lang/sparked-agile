import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schemas
const uuidSchema = z.string().uuid();

// Define allowed integration types for security
const integrationTypeSchema = z.enum([
  "github", 
  "jira", 
  "slack", 
  "teams", 
  "confluence", 
  "azure_devops", 
  "gitlab",
  "bitbucket",
  "trello",
  "asana",
  "linear",
  "webhook",
  "custom"
]);

// Define safe config schema - prevents arbitrary JSON injection
const integrationConfigSchema = z.object({
  webhook_url: z.string().url().max(500).optional(),
  repository: z.string().max(200).optional(),
  board_id: z.string().max(100).optional(),
  channel_id: z.string().max(100).optional(),
  project_key: z.string().max(50).optional(),
  sync_enabled: z.boolean().optional(),
  sync_interval: z.number().int().min(1).max(1440).optional(), // Max 24 hours in minutes
  notification_settings: z.object({
    on_create: z.boolean().optional(),
    on_update: z.boolean().optional(),
    on_delete: z.boolean().optional(),
  }).optional(),
}).strict(); // Reject unknown keys

const integrationCreateSchema = z.object({
  project_id: uuidSchema,
  integration_type: integrationTypeSchema,
  name: z.string().min(1, "Integration name is required").max(100, "Name must be less than 100 characters").trim(),
  config: integrationConfigSchema.optional().default({}),
});

const integrationUpdateSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(100).trim().optional(),
  is_active: z.boolean().optional(),
  config: integrationConfigSchema.optional(),
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

    console.log(`API /integrations called by user ${user.id}, method: ${req.method}`);

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
      const validation = integrationCreateSchema.safeParse(body);
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return new Response(
          JSON.stringify(formatValidationError(validation.error)),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { project_id, integration_type, name, config } = validation.data;

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
      const validation = integrationUpdateSchema.safeParse(body);
      if (!validation.success) {
        console.log("Validation failed:", validation.error.issues);
        return new Response(
          JSON.stringify(formatValidationError(validation.error)),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { id, ...updates } = validation.data;

      // Build safe updates object
      const safeUpdates: Record<string, unknown> = {};
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

      // Validate UUID format
      const uuidResult = uuidSchema.safeParse(id);
      if (!uuidResult.success) {
        return new Response(
          JSON.stringify({ error: "Invalid integration ID format" }),
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
