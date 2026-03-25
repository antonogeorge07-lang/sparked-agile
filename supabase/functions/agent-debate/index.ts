import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

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
    {
      name: 'Sprint Strategist',
      role: 'planning_lead',
      systemPrompt: 'You are a Sprint Planning Strategist. Evaluate sprint plans for feasibility, team capacity alignment, and realistic commitments. Challenge over-commitment and under-utilisation.',
      weight: 1.0,
    },
    {
      name: 'Risk Analyst',
      role: 'risk_assessor',
      systemPrompt: 'You are a Risk Analyst specialising in sprint delivery risks. Identify blockers, dependencies, and capacity risks. Challenge plans that ignore historical velocity data or team constraints.',
      weight: 0.9,
    },
    {
      name: 'Quality Guardian',
      role: 'quality_advocate',
      systemPrompt: 'You are a Quality Guardian. Ensure sprint plans include adequate testing time, technical debt allocation, and definition of done compliance. Challenge plans that sacrifice quality for velocity.',
      weight: 0.8,
    },
  ],
  backlog_priority: [
    {
      name: 'Value Maximiser',
      role: 'value_analyst',
      systemPrompt: 'You are a Value Maximiser. Evaluate backlog items by business value, ROI, and strategic alignment. Challenge items that lack clear value propositions.',
      weight: 1.0,
    },
    {
      name: 'Technical Architect',
      role: 'tech_advisor',
      systemPrompt: 'You are a Technical Architect. Assess technical feasibility, dependencies, and architectural impact. Challenge prioritisation that ignores technical prerequisites.',
      weight: 0.9,
    },
    {
      name: 'User Advocate',
      role: 'user_champion',
      systemPrompt: 'You are a User Advocate. Evaluate items from the end-user perspective. Challenge prioritisation that neglects user experience, accessibility, or user-reported issues.',
      weight: 0.8,
    },
  ],
  risk_assessment: [
    {
      name: 'Delivery Risk Analyst',
      role: 'delivery_risk',
      systemPrompt: 'You are a Delivery Risk Analyst. Focus on timeline risks, resource constraints, and dependency chains. Provide probabilistic risk assessments.',
      weight: 1.0,
    },
    {
      name: 'Technical Risk Analyst',
      role: 'tech_risk',
      systemPrompt: 'You are a Technical Risk Analyst. Focus on architectural risks, performance bottlenecks, security vulnerabilities, and technical debt accumulation.',
      weight: 0.9,
    },
    {
      name: 'Stakeholder Risk Analyst',
      role: 'stakeholder_risk',
      systemPrompt: 'You are a Stakeholder Risk Analyst. Focus on scope creep, changing requirements, communication gaps, and alignment risks between teams and stakeholders.',
      weight: 0.8,
    },
  ],
  epic_validation: [
    {
      name: 'Strategic Alignment Auditor',
      role: 'strategy_auditor',
      systemPrompt: 'You are a Strategic Alignment Auditor. Verify that epic implementation aligns with stated business objectives and strategic goals. Challenge feature scope that drifts from the original vision.',
      weight: 1.0,
    },
    {
      name: 'Delivery Feasibility Analyst',
      role: 'feasibility_analyst',
      systemPrompt: 'You are a Delivery Feasibility Analyst. Assess whether the epic can be delivered within constraints. Challenge unrealistic timelines and resource assumptions.',
      weight: 0.9,
    },
    {
      name: 'Impact Validator',
      role: 'impact_validator',
      systemPrompt: 'You are an Impact Validator. Evaluate whether the epic will deliver measurable outcomes. Challenge epics without clear success metrics or ROI evidence.',
      weight: 0.8,
    },
  ],
  retrospective: [
    {
      name: 'Pattern Analyst',
      role: 'pattern_detector',
      systemPrompt: 'You are a Pattern Analyst. Identify recurring themes, systemic issues, and improvement trends across retrospective feedback. Challenge surface-level observations.',
      weight: 1.0,
    },
    {
      name: 'Action Effectiveness Auditor',
      role: 'action_auditor',
      systemPrompt: 'You are an Action Effectiveness Auditor. Evaluate whether proposed action items are specific, measurable, and achievable. Challenge vague or repeated action items that were never completed.',
      weight: 0.9,
    },
    {
      name: 'Team Health Assessor',
      role: 'health_assessor',
      systemPrompt: 'You are a Team Health Assessor. Read between the lines of feedback to assess team morale, psychological safety, and collaboration quality. Challenge dismissive responses to team concerns.',
      weight: 0.8,
    },
  ],
};

const AGENT_TIMEOUT_MS = 25000; // 25s per agent call

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

async function invokeAgent(
  agent: AgentConfig,
  round: number,
  topic: string,
  context: string,
  previousResponses: string,
  apiKey: string
): Promise<{ content: string; confidence: number }> {
  const roundInstructions = round === 1
    ? `Provide your initial analysis of the following topic. Be specific and evidence-based.`
    : `Review the other agents' perspectives below and provide your critique or validation. Identify areas of agreement, disagreement, and blind spots. Then refine your position.\n\nPrevious agent responses:\n${previousResponses}`;

  const response = await withTimeout(
    fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: agent.systemPrompt },
          {
            role: "user",
            content: `${roundInstructions}\n\nTopic: ${topic}\n\nContext:\n${context}\n\nProvide your analysis in this format:\n## Assessment\n[Your analysis]\n\n## Confidence Level\n[HIGH/MEDIUM/LOW with brief justification]\n\n## Key Concerns\n[Bullet points of concerns or validations]`
          },
        ],
      }),
    }),
    AGENT_TIMEOUT_MS,
    `Agent ${agent.name} Round ${round}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Agent ${agent.name} error:`, response.status, errorText);
    throw new Error(`Agent ${agent.name} failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract confidence from response
  let confidence = 0.7;
  if (content.includes('HIGH')) confidence = 0.9;
  else if (content.includes('LOW')) confidence = 0.5;

  return { content, confidence };
}

async function generateConsensus(
  agents: AgentConfig[],
  responses: Array<{ agent: string; content: string; round: number }>,
  topic: string,
  apiKey: string
): Promise<{ recommendation: string; confidence: number; votes: Array<{ agent: string; vote: string; conditions?: string }> }> {
  const allResponses = responses.map(r =>
    `**${r.agent} (Round ${r.round}):**\n${r.content}`
  ).join('\n\n---\n\n');

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      tools: [{
        type: "function",
        function: {
          name: "submit_consensus",
          description: "Submit the consensus result from the multi-agent debate",
          parameters: {
            type: "object",
            properties: {
              recommendation: { type: "string", description: "The synthesised final recommendation" },
              confidence: { type: "number", description: "Overall confidence 0-1" },
              votes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    agent: { type: "string" },
                    vote: { type: "string", enum: ["approve", "reject", "conditional_approve", "abstain"] },
                    conditions: { type: "string" },
                  },
                  required: ["agent", "vote"],
                },
              },
              key_agreements: { type: "array", items: { type: "string" } },
              key_disagreements: { type: "array", items: { type: "string" } },
              risk_flags: { type: "array", items: { type: "string" } },
            },
            required: ["recommendation", "confidence", "votes", "key_agreements", "key_disagreements", "risk_flags"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "submit_consensus" } },
      messages: [
        {
          role: "system",
          content: "You are a Consensus Mediator synthesising a multi-agent debate. Analyse all agent perspectives, identify areas of agreement and disagreement, and produce a balanced recommendation. Each agent must cast a vote."
        },
        {
          role: "user",
          content: `Synthesise the following multi-agent debate on: "${topic}"\n\nAgent perspectives:\n${allResponses}\n\nDetermine each agent's likely vote based on their final positions. Produce a consensus recommendation that addresses the strongest concerns raised.`
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Consensus generation failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices[0].message.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error('No consensus tool call returned');
  }

  const result = JSON.parse(toolCall.function.arguments);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { topic, topicType, projectId, context } = await req.json();

    if (!topic || !topicType || !projectId) {
      throw new Error('Missing required fields: topic, topicType, projectId');
    }

    const agents = AGENTS[topicType];
    if (!agents) {
      throw new Error(`Invalid topic type: ${topicType}`);
    }

    // Verify project membership
    const { data: project, error: projectError } = await supabase
      .from('pmi_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      throw new Error('Unauthorized: Not a project member');
    }

    // Create debate session
    const { data: session, error: sessionError } = await supabase
      .from('agent_debate_sessions')
      .insert({
        project_id: projectId,
        topic,
        topic_type: topicType,
        context: context || {},
        status: 'debating',
        initiated_by: user.id,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    console.log(`Starting debate session ${session.id} with ${agents.length} agents on: ${topic}`);

    const allResponses: Array<{ agent: string; content: string; round: number; confidence: number }> = [];

    const QUORUM_THRESHOLD = 2; // Minimum agents needed for valid consensus

    // ROUND 1: Initial proposals (parallel execution)
    const round1Results = await Promise.allSettled(
      agents.map(async (agent) => {
        const result = await invokeAgent(
          agent, 1, topic, JSON.stringify(context || {}), '', LOVABLE_API_KEY
        );

        await supabase.from('agent_debate_responses').insert({
          session_id: session.id,
          agent_name: agent.name,
          agent_role: agent.role,
          round_number: 1,
          response_type: 'proposal',
          content: result.content,
          confidence_score: result.confidence,
          reasoning: `Initial ${agent.role} assessment`,
        });

        return {
          agent: agent.name,
          content: result.content,
          round: 1,
          confidence: result.confidence,
        };
      })
    );

    // Collect successful Round 1 responses
    for (const result of round1Results) {
      if (result.status === 'fulfilled') {
        allResponses.push(result.value);
      } else {
        console.error('Round 1 agent failed:', result.reason?.message || result.reason);
      }
    }

    // Quorum check: abort if too few agents responded
    if (allResponses.length < QUORUM_THRESHOLD) {
      await supabase
        .from('agent_debate_sessions')
        .update({ status: 'failed', completed_at: new Date().toISOString() })
        .eq('id', session.id);
      throw new Error(`Quorum not met: only ${allResponses.length}/${agents.length} agents responded (need ${QUORUM_THRESHOLD})`);
    }

    // ROUND 2: Critique & validation (parallel, only for agents that responded in R1)
    const round1Summary = allResponses
      .map(r => `**${r.agent}:** ${r.content}`)
      .join('\n\n');

    const round1AgentNames = new Set(allResponses.map(r => r.agent));
    const round2Agents = agents.filter(a => round1AgentNames.has(a.name));

    const round2Results = await Promise.allSettled(
      round2Agents.map(async (agent) => {
        const result = await invokeAgent(
          agent, 2, topic, JSON.stringify(context || {}), round1Summary, LOVABLE_API_KEY
        );

        const otherAgents = allResponses.filter(r => r.agent !== agent.name && r.round === 1);
        const agrees = otherAgents
          .filter(r => r.confidence > 0.7)
          .map(r => r.agent);
        const disagrees = otherAgents
          .filter(r => r.confidence <= 0.5)
          .map(r => r.agent);

        await supabase.from('agent_debate_responses').insert({
          session_id: session.id,
          agent_name: agent.name,
          agent_role: agent.role,
          round_number: 2,
          response_type: 'critique',
          content: result.content,
          confidence_score: result.confidence,
          agrees_with: agrees,
          disagrees_with: disagrees,
          reasoning: `Critique after reviewing ${round2Agents.length - 1} peer analyses`,
        });

        return {
          agent: agent.name,
          content: result.content,
          round: 2,
          confidence: result.confidence,
        };
      })
    );

    for (const result of round2Results) {
      if (result.status === 'fulfilled') {
        allResponses.push(result.value);
      } else {
        console.error('Round 2 agent failed:', result.reason?.message || result.reason);
      }
    }

    // ROUND 3: Consensus & voting
    await supabase
      .from('agent_debate_sessions')
      .update({ status: 'voting' })
      .eq('id', session.id);

    const consensus = await withTimeout(
      generateConsensus(agents, allResponses, topic, LOVABLE_API_KEY),
      30000,
      'Consensus generation'
    );

    // Record votes
    for (const vote of consensus.votes) {
      const agentConfig = agents.find(a => a.name === vote.agent);
      await supabase.from('agent_consensus_votes').insert({
        session_id: session.id,
        agent_name: vote.agent,
        vote: vote.vote,
        conditions: vote.conditions || null,
        weight: agentConfig?.weight || 1.0,
      });
    }

    // Calculate weighted consensus confidence
    const weightedSum = consensus.votes.reduce((sum, vote) => {
      const agent = agents.find(a => a.name === vote.agent);
      const w = agent?.weight || 1.0;
      const voteScore = vote.vote === 'approve' ? 1 : vote.vote === 'conditional_approve' ? 0.7 : vote.vote === 'abstain' ? 0.5 : 0;
      return sum + (voteScore * w);
    }, 0);
    const totalWeight = agents.reduce((sum, a) => sum + a.weight, 0);
    const finalConfidence = Math.round((weightedSum / totalWeight) * 100) / 100;

    // Finalise session
    await supabase
      .from('agent_debate_sessions')
      .update({
        status: 'consensus_reached',
        consensus_result: consensus,
        consensus_confidence: finalConfidence,
        final_recommendation: consensus.recommendation,
        completed_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    // Persist as AI suggestion
    await supabase.from('ai_suggestions').insert({
      project_id: projectId,
      suggestion_type: `debate_${topicType}`,
      title: `Multi-Agent Consensus: ${topic.substring(0, 100)}`,
      content: consensus.recommendation,
      confidence_score: finalConfidence,
      status: 'pending',
      metadata: {
        debate_session_id: session.id,
        agents_involved: agents.map(a => a.name),
        rounds_completed: 2,
        vote_summary: consensus.votes,
      },
    });

    console.log(`Debate ${session.id} completed. Confidence: ${finalConfidence}`);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        status: 'consensus_reached',
        recommendation: consensus.recommendation,
        confidence: finalConfidence,
        votes: consensus.votes,
        agentCount: agents.length,
        roundsCompleted: 2,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agent debate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Debate failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
