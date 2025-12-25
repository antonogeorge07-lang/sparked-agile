import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting state (per-function instance)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(userId: string): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, waitSeconds: 0 };
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    const waitSeconds = Math.ceil((userLimit.resetAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }
  
  userLimit.count++;
  return { allowed: true, waitSeconds: 0 };
}

serve(async (req) => {
  const requestStart = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${requestId}] Starting project insights generation`);
    
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] Missing authorization header`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      console.error(`[${requestId}] Auth error:`, userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      console.warn(`[${requestId}] Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Try again in ${rateCheck.waitSeconds} seconds`,
          retryAfter: rateCheck.waitSeconds 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.waitSeconds)
          } 
        }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const { projectId, includeVelocity = true, includeRisks = true } = body;

    if (!projectId || typeof projectId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify project membership
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('id, role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      console.error(`[${requestId}] User not member of project`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Not a project member' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Fetching project data for ${projectId}`);

    // Fetch project data in parallel
    const [tasksResult, velocityResult, risksResult, projectResult] = await Promise.all([
      supabase
        .from('project_tasks')
        .select('id, title, status, stage, due_date, progress, created_at, updated_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50),
      
      includeVelocity ? supabase
        .from('sprint_velocity_history')
        .select('sprint_number, committed_points, delivered_points, created_at')
        .eq('project_id', projectId)
        .order('sprint_number', { ascending: false })
        .limit(12) : { data: [], error: null },
      
      includeRisks ? supabase
        .from('project_risks')
        .select('id, risk_title, probability, impact, status')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .limit(10) : { data: [], error: null },
      
      supabase
        .from('projects')
        .select('name, created_at')
        .eq('id', projectId)
        .single()
    ]);

    const tasks = tasksResult.data || [];
    const velocity = velocityResult.data || [];
    const risks = risksResult.data || [];
    const project = projectResult.data;

    // Calculate metrics for AI context
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    );
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    
    // Stage distribution
    const stageDistribution: Record<string, number> = {};
    tasks.forEach(t => {
      stageDistribution[t.stage] = (stageDistribution[t.stage] || 0) + 1;
    });

    // Velocity stats
    const avgVelocity = velocity.length > 0 
      ? velocity.reduce((sum, v) => sum + (v.delivered_points || 0), 0) / velocity.length 
      : 0;
    
    const avgAccuracy = velocity.length > 0 && velocity.some(v => v.committed_points > 0)
      ? velocity
          .filter(v => v.committed_points > 0)
          .reduce((sum, v) => sum + ((v.delivered_points / v.committed_points) * 100), 0) / 
        velocity.filter(v => v.committed_points > 0).length
      : 0;

    // Calculate remaining work estimate
    const remainingTasks = tasks.filter(t => t.status !== 'completed').length;
    const tasksPerSprint = avgVelocity > 0 ? Math.ceil(remainingTasks / (avgVelocity / 5)) : 0;

    console.log(`[${requestId}] Calling AI for insights generation`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert project management AI assistant. Analyze the project data and provide actionable insights. Be concise and data-driven.

Always respond with valid JSON in this exact format:
{
  "riskLevel": "low" | "medium" | "high",
  "riskScore": number (0-100),
  "riskFactors": ["factor1", "factor2"],
  "completionEta": "estimated date or range",
  "sprintsRemaining": number,
  "confidence": "low" | "medium" | "high",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "healthStatus": "healthy" | "at-risk" | "critical",
  "velocityTrend": "improving" | "stable" | "declining",
  "summary": "1-2 sentence executive summary"
}`;

    const userPrompt = `Analyze this project and provide insights:

**Project**: ${project?.name || 'Unknown'}
**Total Tasks**: ${tasks.length}
**Completed**: ${completedTasks.length} (${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%)
**In Progress**: ${inProgressTasks.length}
**Overdue**: ${overdueTasks.length}

**Stage Distribution**:
${Object.entries(stageDistribution).map(([stage, count]) => `- ${stage}: ${count}`).join('\n')}

**Velocity Data** (last ${velocity.length} sprints):
- Average Velocity: ${avgVelocity.toFixed(1)} points/sprint
- Average Accuracy: ${avgAccuracy.toFixed(1)}%
- Recent trend: ${velocity.length >= 2 ? 
    (velocity[0]?.delivered_points > velocity[1]?.delivered_points ? 'improving' : 
     velocity[0]?.delivered_points < velocity[1]?.delivered_points ? 'declining' : 'stable') 
    : 'insufficient data'}

**Active Risks**: ${risks.length}
${risks.map(r => `- ${r.risk_title} (P: ${r.probability}, I: ${r.impact})`).join('\n') || 'None tracked'}

**Remaining Work**: ${remainingTasks} tasks
**Estimated Sprints**: ~${tasksPerSprint || 'unknown'} (based on avg velocity)

Provide your analysis as JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[${requestId}] AI API error:`, aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limits reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices[0].message.content;
    
    // Parse AI response (handle potential markdown code blocks)
    let insights;
    try {
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseContent;
      insights = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse AI response:`, parseError);
      // Provide fallback insights
      insights = {
        riskLevel: overdueTasks.length > 5 ? 'high' : overdueTasks.length > 2 ? 'medium' : 'low',
        riskScore: Math.min(100, overdueTasks.length * 10 + (100 - avgAccuracy)),
        riskFactors: overdueTasks.length > 0 ? ['Overdue tasks detected'] : [],
        completionEta: tasksPerSprint > 0 ? `~${tasksPerSprint * 2} weeks` : 'Unable to estimate',
        sprintsRemaining: tasksPerSprint,
        confidence: velocity.length >= 5 ? 'high' : velocity.length >= 2 ? 'medium' : 'low',
        recommendations: ['Continue tracking velocity', 'Address overdue items'],
        healthStatus: overdueTasks.length > 5 ? 'critical' : overdueTasks.length > 2 ? 'at-risk' : 'healthy',
        velocityTrend: 'stable',
        summary: 'Analysis completed with limited data.'
      };
    }

    // Add computed data to response
    const response = {
      insights,
      metrics: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        inProgressTasks: inProgressTasks.length,
        avgVelocity: Math.round(avgVelocity * 10) / 10,
        avgAccuracy: Math.round(avgAccuracy),
        activeRisks: risks.length,
        stageDistribution
      },
      generatedAt: new Date().toISOString()
    };

    const duration = Date.now() - requestStart;
    console.log(`[${requestId}] Completed in ${duration}ms`);

    // Log AI usage (fire and forget)
    supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'generate-project-insights',
      model: 'google/gemini-2.5-flash',
      tokens_used: 0,
      status: 'success',
      project_id: projectId
    }).then(() => {
      console.log(`[${requestId}] AI usage logged`);
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - requestStart;
    console.error(`[${requestId}] Error after ${duration}ms:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
