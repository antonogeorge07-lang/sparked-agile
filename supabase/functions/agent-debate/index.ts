import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  weight: number;
}

const AGENTS: Record<string, AgentConfig[]> = {
  sprint_plan: [
    { name: 'Sprint Strategist', role: 'planning_lead', systemPrompt: 'You are a Sprint Planning Strategist.', weight: 1.0 },
    { name: 'Risk Analyst', role: 'risk_assessor', systemPrompt: 'You are a Risk Analyst.', weight: 0.9 },
    { name: 'Quality Guardian', role: 'quality_advocate', systemPrompt: 'You are a Quality Guardian.', weight: 0.8 },
  ],
};

async function getHistoricalContext(supabase: SupabaseClient, projectId: string, topicType: string): Promise<string> {
  const { data, error } = await supabase
    .from('agent_debate_sessions')
    .select('final_recommendation, topic')
    .eq('project_id', projectId)
    .eq('topic_type', topicType)
    .eq('status', 'consensus_reached')
    .order('completed_at', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) return "No prior history.";
  
  return data.map((d: { topic: string; final_recommendation: string }) => 
    `Prior Topic: ${d.topic} | Verdict: ${d.final_recommendation}`
  ).join('\n');
}

async function invokeAgent(agent: AgentConfig, round: number, topic: string, context: string, previousResponses: string, apiKey: string): Promise<{ content: string; confidence: number }> {
  const roundInstructions = round === 1 ? `Analyze the topic.` : `Review other agents' perspectives:\n${previousResponses}`;
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: agent.systemPrompt }, 
        { role: "user", content: `${roundInstructions}\n\nTopic: ${topic}\n\n${context}` }
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  return { content, confidence: content.includes('HIGH') ? 0.9 : 0.7 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    
    // Initialize client for data access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_ANON_KEY')!, 
      { global: { headers: { Authorization: authHeader } } }
    );

    // Auth Bypass for local development
    const isLocal = Deno.env.get('SUPABASE_URL')?.includes('127.0.0.1');
    if (!isLocal) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Unauthorized');
    }
    
    // Parse request and execute agent workflow
    const { topic, topicType, projectId, context } = await req.json();
    const historicalMemory = await getHistoricalContext(supabase, projectId, topicType);
    const agents = AGENTS[topicType];

    const results = await Promise.allSettled(
      agents.map(agent => invokeAgent(agent, 1, topic, `Context: ${JSON.stringify(context)}\nMemory: ${historicalMemory}`, '', Deno.env.get("LOVABLE_API_KEY")!))
    );

    return new Response(JSON.stringify({ status: 'consensus_reached', results }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders } });
  }
});