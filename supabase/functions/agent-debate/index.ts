import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  weight: number;
}

interface AgentAnswer {
  agent: AgentConfig;
  content: string;
  confidence: number;
}

const SHARED_AGENTS = [
  { name: "Sprint Strategist", role: "planning_lead", systemPrompt: "Assess delivery feasibility, sequencing, dependencies, and measurable outcomes.", weight: 1 },
  { name: "Risk Analyst", role: "risk_assessor", systemPrompt: "Challenge assumptions and identify delivery, security, compliance, and dependency risks.", weight: 0.95 },
  { name: "Quality Guardian", role: "quality_advocate", systemPrompt: "Protect acceptance criteria, maintainability, testing, and user value.", weight: 0.9 },
];

const AGENTS: Record<string, AgentConfig[]> = {
  sprint_plan: SHARED_AGENTS,
  backlog_priority: SHARED_AGENTS,
  risk_assessment: SHARED_AGENTS,
  epic_validation: SHARED_AGENTS,
  retrospective: SHARED_AGENTS,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function getHistoricalContext(supabase: SupabaseClient, projectId: string, topicType: string) {
  const { data } = await supabase
    .from("agent_debate_sessions")
    .select("final_recommendation, topic")
    .eq("project_id", projectId)
    .eq("topic_type", topicType)
    .eq("status", "consensus_reached")
    .order("completed_at", { ascending: false })
    .limit(3);

  if (!data?.length) return "No prior history.";
  return data.map((row) => `Prior topic: ${row.topic} | Verdict: ${row.final_recommendation}`).join("\n");
}

async function invokeAgent(agent: AgentConfig, topic: string, context: string, apiKey: string): Promise<AgentAnswer> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: agent.systemPrompt },
        { role: "user", content: `Topic: ${topic}\n\nProject evidence:\n${context}\n\nGive a concise recommendation, material risks, and confidence.` },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message ?? payload?.message ?? `AI gateway returned HTTP ${response.status}`;
    throw new Error(detail);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("AI gateway returned an empty response");
  const confidence = /high confidence/i.test(content) ? 0.9 : /low confidence/i.test(content) ? 0.55 : 0.75;
  return { agent, content: content.trim(), confidence };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sign in before launching AI agents" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: "Your session has expired. Sign in again." }, 401);

    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const topicType = typeof body.topicType === "string" ? body.topicType : "";
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const context = body.context && typeof body.context === "object" ? body.context : {};

    if (!topic || !projectId || !AGENTS[topicType]) {
      return json({ error: "Select a valid project, debate type, and topic." });
    }

    const { data: project } = await supabase
      .from("pmi_projects")
      .select("id, name")
      .eq("id", projectId)
      .maybeSingle();
    if (!project) return json({ error: "The selected Command Centre project is unavailable or access was denied." });

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI agents are not configured. Add LOVABLE_API_KEY to Supabase function secrets." });

    const { data: session, error: sessionError } = await supabase
      .from("agent_debate_sessions")
      .insert({
        project_id: projectId,
        topic,
        topic_type: topicType,
        context,
        initiated_by: user.id,
        status: "debating",
      })
      .select("id")
      .single();
    if (sessionError || !session) return json({ error: sessionError?.message ?? "Could not start the debate session." });

    const memory = await getHistoricalContext(supabase, projectId, topicType);
    const evidence = `Project: ${project.name}\nContext: ${JSON.stringify(context)}\nHistory: ${memory}`;
    const settled = await Promise.allSettled(
      AGENTS[topicType].map((configuredAgent) => invokeAgent(configuredAgent, topic, evidence, apiKey)),
    );
    const answers = settled
      .filter((result): result is PromiseFulfilledResult<AgentAnswer> => result.status === "fulfilled")
      .map((result) => result.value);

    if (!answers.length) {
      const reason = settled.find((result) => result.status === "rejected");
      const detail = reason?.status === "rejected" && reason.reason instanceof Error ? reason.reason.message : "AI provider unavailable";
      await supabase.from("agent_debate_sessions").update({ status: "cancelled", completed_at: new Date().toISOString() }).eq("id", session.id);
      return json({ error: `AI agents could not respond: ${detail}` });
    }

    await supabase.from("agent_debate_responses").insert(
      answers.map((answer) => ({
        session_id: session.id,
        agent_name: answer.agent.name,
        agent_role: answer.agent.role,
        round_number: 1,
        response_type: "proposal",
        content: answer.content,
        confidence_score: answer.confidence,
        reasoning: answer.content,
      })),
    );

    const confidence = answers.reduce((total, answer) => total + answer.confidence * answer.agent.weight, 0)
      / answers.reduce((total, answer) => total + answer.agent.weight, 0);
    const recommendation = answers.map((answer) => `${answer.agent.name}: ${answer.content}`).join("\n\n");
    const votes = answers.map((answer) => ({ agent: answer.agent.name, vote: "conditional_approve" as const, conditions: answer.content }));

    await supabase.from("agent_debate_sessions").update({
      status: "consensus_reached",
      consensus_confidence: confidence,
      final_recommendation: recommendation,
      consensus_result: { votes },
      completed_at: new Date().toISOString(),
    }).eq("id", session.id);

    return json({
      sessionId: session.id,
      status: "consensus_reached",
      recommendation,
      confidence,
      votes,
      agentCount: answers.length,
      roundsCompleted: 1,
    });
  } catch (error) {
    console.error("agent-debate", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "The AI debate could not be completed. Please retry." });
  }
});
