import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Input validation
    const { teamSize, capacity, backlogItems, projectId } = await req.json();
    
    if (!teamSize || typeof teamSize !== 'number' || teamSize < 1 || teamSize > 1000) {
      throw new Error('Invalid team size (must be 1-1000)');
    }

    if (!capacity || typeof capacity !== 'number' || capacity < 1 || capacity > 10000) {
      throw new Error('Invalid capacity (must be 1-10000)');
    }

    if (!backlogItems || typeof backlogItems !== 'string') {
      throw new Error('Invalid backlog items (must be a string)');
    }

    if (backlogItems.length > 10000) {
      throw new Error('Backlog items too large (max 10000 characters)');
    }

    // Verify user has access to project if projectId provided
    if (projectId) {
      const { data: membership, error: memberError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership) {
        throw new Error('Unauthorized: User is not a member of this project');
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating sprint plan for team of", teamSize, "with capacity", capacity);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a Scrum Master assistant helping with sprint planning. Provide practical, data-driven recommendations based on team capacity and backlog priorities."
          },
          {
            role: "user",
            content: `Team size: ${teamSize} members\nStory points capacity: ${capacity}\n\nBacklog items:\n${backlogItems}\n\nProvide:\n1. Recommended sprint commitment (story point range)\n2. Priority items to include\n3. Items to defer\n4. Risk assessment and suggestions`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const plan = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ plan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-sprint-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
