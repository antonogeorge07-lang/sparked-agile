import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CopilotRequest {
  action: 
    | "generate_user_story"
    | "suggest_acceptance_criteria"
    | "estimate_story_points"
    | "detect_blockers"
    | "suggest_assignments"
    | "forecast_sprint"
    | "analyze_backlog"
    | "generate_sprint_goal"
    | "balance_workload";
  projectId: string;
  sprintId?: string;
  itemId?: string;
  context?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use anon key + user JWT to respect RLS policies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, projectId, sprintId, itemId, context }: CopilotRequest = await req.json();

    // Verify project access
    // RLS will enforce access — query scoped to user's projects
    const { data: project } = await supabase
      .from("pmi_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather context based on action
    let systemPrompt = `You are an AI Co-Pilot for project management. You help teams with agile/scrum practices, 
task management, and project planning. Be concise and actionable. Project: "${project.name}".`;
    
    let userPrompt = "";
    let additionalContext: Record<string, any> = {};

    switch (action) {
      case "generate_user_story": {
        const { title, description } = context || {};
        userPrompt = `Generate a well-structured user story based on this requirement:
Title: ${title || "New feature"}
Description: ${description || "No description provided"}

Format as:
- User Story: "As a [role], I want [feature] so that [benefit]"
- Description: Detailed explanation
- Acceptance Criteria: List of testable criteria
- Suggested Story Points: 1, 2, 3, 5, 8, or 13`;
        break;
      }

      case "suggest_acceptance_criteria": {
        const { data: item } = await supabase
          .from("native_backlog_items")
          .select("*")
          .eq("id", itemId)
          .single();

        userPrompt = `Suggest 3-5 acceptance criteria for this backlog item:
Title: ${item?.title}
Description: ${item?.description || "No description"}
Type: ${item?.item_type}

Format each criterion as a testable condition starting with "Given/When/Then" or "User can..."`;
        break;
      }

      case "estimate_story_points": {
        const { data: item } = await supabase
          .from("native_backlog_items")
          .select("*")
          .eq("id", itemId)
          .single();

        // Get historical velocity
        const { data: completedItems } = await supabase
          .from("native_backlog_items")
          .select("story_points, title")
          .eq("project_id", projectId)
          .eq("status", "done")
          .not("story_points", "is", null)
          .limit(10);

        userPrompt = `Estimate story points for this item using Fibonacci scale (1, 2, 3, 5, 8, 13):
Title: ${item?.title}
Description: ${item?.description || "No description"}
Type: ${item?.item_type}
Acceptance Criteria: ${item?.acceptance_criteria?.join(", ") || "None specified"}

Historical reference (recently completed items):
${completedItems?.map(i => `- "${i.title}": ${i.story_points} points`).join("\n") || "No historical data"}

Provide:
1. Recommended story points
2. Confidence level (low/medium/high)
3. Brief reasoning`;
        break;
      }

      case "detect_blockers": {
        const { data: items } = await supabase
          .from("native_backlog_items")
          .select("*")
          .eq("project_id", projectId)
          .in("status", ["in_progress", "in_review", "testing"])
          .order("updated_at", { ascending: true });

        userPrompt = `Analyze these in-progress items for potential blockers:
${items?.map(i => `- "${i.title}" (${i.status}, ${i.priority} priority, updated: ${i.updated_at})`).join("\n") || "No items in progress"}

Identify:
1. Items that haven't been updated recently (potential stalls)
2. High priority items that might be blocked
3. Dependencies that could cause issues
4. Recommendations to unblock progress`;
        break;
      }

      case "suggest_assignments": {
        const { data: items } = await supabase
          .from("native_backlog_items")
          .select("*")
          .eq("project_id", projectId)
          .is("assignee_id", null)
          .eq("status", "open")
          .limit(10);

        const { data: recentAssignments } = await supabase
          .from("native_backlog_items")
          .select("assignee_id, item_type, labels")
          .eq("project_id", projectId)
          .not("assignee_id", "is", null)
          .eq("status", "done")
          .limit(20);

        userPrompt = `Suggest task assignments for unassigned items:
Unassigned items:
${items?.map(i => `- "${i.title}" (${i.item_type}, ${i.priority} priority, ${i.story_points || "?"} points)`).join("\n") || "No unassigned items"}

Based on team patterns and workload, suggest which types of items should be grouped together and prioritized for assignment.`;
        break;
      }

      case "forecast_sprint": {
        const { data: sprint } = await supabase
          .from("native_sprints")
          .select("*")
          .eq("id", sprintId)
          .single();

        const { data: sprintItems } = await supabase
          .from("native_backlog_items")
          .select("*")
          .eq("sprint_id", sprintId);

        const { data: burndown } = await supabase
          .from("sprint_burndown")
          .select("*")
          .eq("sprint_id", sprintId)
          .order("snapshot_date", { ascending: true });

        const totalPoints = sprintItems?.reduce((sum, i) => sum + (i.story_points || 0), 0) || 0;
        const completedPoints = sprintItems?.filter(i => i.status === "done")
          .reduce((sum, i) => sum + (i.story_points || 0), 0) || 0;

        userPrompt = `Forecast sprint completion:
Sprint: ${sprint?.name}
Duration: ${sprint?.start_date} to ${sprint?.end_date}
Goal: ${sprint?.goal || "No goal specified"}
Committed: ${sprint?.velocity_committed} points
Total items: ${sprintItems?.length || 0}
Total points: ${totalPoints}
Completed points: ${completedPoints}

Burndown trend:
${burndown?.map(b => `${b.snapshot_date}: ${b.remaining_points} remaining`).join("\n") || "No burndown data yet"}

Provide:
1. Likelihood of completing sprint goal (%)
2. Estimated completion date
3. Risk factors
4. Recommendations`;
        break;
      }

      case "analyze_backlog": {
        const { data: backlogItems } = await supabase
          .from("native_backlog_items")
          .select("*")
          .eq("project_id", projectId)
          .is("sprint_id", null)
          .order("position", { ascending: true });

        const byType = backlogItems?.reduce((acc: Record<string, number>, item) => {
          acc[item.item_type] = (acc[item.item_type] || 0) + 1;
          return acc;
        }, {}) || {};

        const byPriority = backlogItems?.reduce((acc: Record<string, number>, item) => {
          acc[item.priority] = (acc[item.priority] || 0) + 1;
          return acc;
        }, {}) || {};

        userPrompt = `Analyze backlog health:
Total items in backlog: ${backlogItems?.length || 0}
By type: ${JSON.stringify(byType)}
By priority: ${JSON.stringify(byPriority)}

Top 5 items:
${backlogItems?.slice(0, 5).map(i => `- "${i.title}" (${i.item_type}, ${i.priority})`).join("\n") || "Empty backlog"}

Provide:
1. Overall backlog health assessment
2. Items that need refinement
3. Priority balancing recommendations
4. Suggested next actions`;
        break;
      }

      case "generate_sprint_goal": {
        const { items } = context || {};
        
        userPrompt = `Generate a sprint goal based on these planned items:
${items?.map((i: any) => `- "${i.title}" (${i.item_type}, ${i.story_points || "?"} points)`).join("\n") || "No items provided"}

Create a clear, measurable sprint goal that:
1. Summarizes the business value delivered
2. Is achievable within the sprint
3. Aligns team focus`;
        break;
      }

      case "balance_workload": {
        const { data: activeItems } = await supabase
          .from("native_backlog_items")
          .select("assignee_id, status, story_points, title")
          .eq("project_id", projectId)
          .eq("sprint_id", sprintId)
          .not("assignee_id", "is", null);

        const workloadByAssignee = activeItems?.reduce((acc: Record<string, { total: number; items: string[] }>, item) => {
          const id = item.assignee_id || "unassigned";
          if (!acc[id]) acc[id] = { total: 0, items: [] };
          acc[id].total += item.story_points || 0;
          acc[id].items.push(item.title);
          return acc;
        }, {}) || {};

        userPrompt = `Analyze workload balance:
${Object.entries(workloadByAssignee).map(([id, data]) => 
  `Team member ${id.slice(0, 8)}: ${data.total} points (${data.items.length} items)`
).join("\n") || "No assignments"}

Identify:
1. Overloaded team members
2. Underutilized capacity
3. Rebalancing suggestions`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${status}`);
    }

    const aiData = await aiResponse.json();
    const suggestion = aiData.choices?.[0]?.message?.content || "No suggestion generated";

    // Store suggestion in database
    const { data: savedSuggestion, error: saveError } = await supabase
      .from("ai_suggestions")
      .insert({
        project_id: projectId,
        item_id: itemId || null,
        sprint_id: sprintId || null,
        suggestion_type: action === "generate_user_story" ? "user_story_generation" :
                        action === "suggest_acceptance_criteria" ? "acceptance_criteria" :
                        action === "estimate_story_points" ? "story_points" :
                        action === "detect_blockers" ? "blocker_detection" :
                        action === "suggest_assignments" ? "task_assignment" :
                        action === "forecast_sprint" ? "velocity_forecast" :
                        action === "analyze_backlog" ? "risk_prediction" :
                        action === "generate_sprint_goal" ? "sprint_capacity" :
                        "workload_balance",
        title: `AI ${action.replace(/_/g, " ")}`,
        content: suggestion,
        confidence_score: 0.85,
        metadata: { action, context: context || {} },
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      suggestion,
      suggestionId: savedSuggestion?.id,
      action,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Co-Pilot error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
