// Suggest risks or lessons learned for a PMI project using Lovable AI.
// Returns suggestions only — never writes to DB. The user decides what to add.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Suggestion {
  title: string;
  description: string;
  category: string;
  impact: "Low" | "Medium" | "High";
  probability?: "Low" | "Medium" | "High";
  mitigation_strategy?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { projectId, type } = await req.json();
    if (!projectId || !["risks", "lessons"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "projectId and type ('risks'|'lessons') required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: project, error: pErr } = await supabase
      .from("pmi_projects")
      .select("id, name, description")
      .eq("id", projectId)
      .maybeSingle();
    if (pErr || !project) {
      return new Response(
        JSON.stringify({ error: "Project not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: tasks } = await supabase
      .from("pmi_tasks")
      .select("title, description, status, stage, due_date, progress")
      .eq("project_id", projectId)
      .limit(80);

    const { data: existingRisks } = type === "risks"
      ? await supabase
          .from("risk_register")
          .select("risk_title")
          .eq("project_id", projectId)
      : { data: [] as any[] };

    const { data: existingLessons } = type === "lessons"
      ? await supabase
          .from("lessons_learned")
          .select("title")
          .eq("project_id", projectId)
      : { data: [] as any[] };

    const taskSummary = (tasks ?? []).map((t) =>
      `- [${t.stage}/${t.status}] ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""}${
        t.description ? ` — ${String(t.description).slice(0, 120)}` : ""
      }`
    ).join("\n");

    const exclusionList = type === "risks"
      ? (existingRisks ?? []).map((r) => `- ${r.risk_title}`).join("\n")
      : (existingLessons ?? []).map((l) => `- ${l.title}`).join("\n");

    const isRisks = type === "risks";
    const schemaBlock = isRisks
      ? `[{"title":"...","description":"...","category":"Technical|Schedule|Resource|Scope|External","probability":"Low|Medium|High","impact":"Low|Medium|High","mitigation_strategy":"..."}]`
      : `[{"title":"...","description":"...","category":"Process|Technical|Communication|Resource|Other","impact":"Low|Medium|High"}]`;

    const prompt = `You are an experienced PMI-aligned project manager assisting with project "${project.name}".
${project.description ? `Project context: ${project.description}\n` : ""}
Project tasks (most recent 80):
${taskSummary || "(no tasks yet)"}

Already documented (DO NOT repeat or paraphrase these):
${exclusionList || "(none)"}

Generate 3 to 5 ${
      isRisks
        ? "potential project risks the team should consider"
        : "potential lessons learned worth documenting"
    } based ONLY on the evidence above. Be specific, concise, and actionable. British English.

Return STRICT JSON (no prose, no markdown fences) matching exactly:
${schemaBlock}`;

    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!aiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You output only valid JSON arrays. No prose." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const content: string = aiJson?.choices?.[0]?.message?.content ?? "[]";
    const cleaned = content.replace(/```json|```/g, "").trim();
    let suggestions: Suggestion[] = [];
    try {
      suggestions = JSON.parse(cleaned);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        try { suggestions = JSON.parse(match[0]); } catch { suggestions = []; }
      }
    }

    return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 5) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
