import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory rate limiter: max 10 validations per user per hour
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication: validate JWT via getClaims()
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Use getClaims() for efficient JWT verification
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Rate limiting per user
    if (!checkRateLimit(userId)) {
      console.log(`Rate limit exceeded for user: ${userId}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 validations per hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input validation
    const { epicId } = await req.json();
    if (!epicId) {
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(epicId)) {
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Validating epic implementation:', epicId, 'by user:', userId);

    // Fetch epic data using user context (RLS enforced - verifies access)
    const { data: epic, error: epicError } = await supabaseClient
      .from('epics')
      .select(`*, value_streams(id, name, description)`)
      .eq('id', epicId)
      .single();

    if (epicError || !epic) {
      // Generic error to prevent enumeration
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch features using user context (RLS enforced)
    const { data: features, error: featuresError } = await supabaseClient
      .from('features')
      .select('*')
      .eq('epic_id', epicId)
      .order('display_order', { ascending: true });

    if (featuresError) {
      console.error('Error fetching features:', featuresError);
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch dependencies using user context (RLS enforced)
    const { data: dependencies, error: depsError } = await supabaseClient
      .from('epic_dependencies')
      .select(`*, depends_on:depends_on_epic_id(id, title, status)`)
      .eq('epic_id', epicId);

    if (depsError) console.error('Error fetching dependencies:', depsError);

    // Fetch milestones using user context (RLS enforced)
    const { data: milestones, error: milestonesError } = await supabaseClient
      .from('epic_milestones')
      .select('*')
      .eq('epic_id', epicId)
      .order('target_date', { ascending: true });

    if (milestonesError) console.error('Error fetching milestones:', milestonesError);

    // Build feature map for linking results back
    const featureMap = new Map((features || []).map(f => [f.title.toLowerCase().trim(), f]));

    const epicContext = {
      epic: {
        title: epic.title,
        description: epic.description,
        status: epic.status,
        priority: epic.priority,
        business_value: epic.business_value,
        business_justification: epic.business_justification,
        strategic_goals: epic.strategic_goals,
        acceptance_criteria: epic.acceptance_criteria,
        start_date: epic.start_date,
        end_date: epic.end_date,
        effort_estimate: epic.effort_estimate,
        health_score: epic.health_score,
        roi_score: epic.roi_score,
        value_stream: epic.value_streams?.name,
      },
      features: (features || []).map(f => ({
        title: f.title,
        description: f.description,
        status: f.status,
        priority: f.priority,
        effort_estimate: f.effort_estimate,
      })),
      dependencies: (dependencies || []).map(d => ({
        type: d.dependency_type,
        status: d.status,
        depends_on_title: d.depends_on?.title,
        depends_on_status: d.depends_on?.status,
        notes: d.notes,
      })),
      milestones: (milestones || []).map(m => ({
        title: m.title,
        status: m.status,
        target_date: m.target_date,
        completion_date: m.completion_date,
        completion_percentage: m.completion_percentage,
      })),
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are the Lovable LLM - an intelligent Agile validation companion integrated within Spark Agile.
Your role is to ensure every Epic, Feature, or Story that is marked as "Yet to Implement" truly deserves to be implemented.

Analyse the provided epic data, goals, dependencies, and current feature items.

For each feature/item, determine:
- IMPLEMENT - if implementation is necessary and aligned to the Epic's strategic intent.
- REVIEW - if it is partially redundant, already covered by another deliverable, or conflicting with dependencies.
- DO NOT IMPLEMENT - if it should not be implemented, due to duplication, lack of business value, or outdated context.

IMPORTANT: The "item" field in validationItems MUST exactly match the feature title from the input data.

Respond with valid JSON using this exact schema:
{
  "epicSummary": "Brief recap of the epic's strategic intent",
  "validationItems": [
    {
      "item": "Exact feature title from the data",
      "status": "Current status",
      "decision": "implement" | "review" | "do_not_implement",
      "reasoning": "Why this decision was made",
      "recommendation": "Actionable next step"
    }
  ],
  "deliveryAlignmentCheck": "Assessment of alignment with original goals, OKRs, and DoD criteria",
  "verdict": {
    "alignment": "aligned" | "misaligned" | "requires_review",
    "summary": "Concise judgment statement"
  },
  "nextSteps": ["Clear actionable step 1", "Clear actionable step 2"],
  "effortAnalysis": {
    "totalEstimatedPoints": number or null,
    "implementPoints": number or null,
    "reviewPoints": number or null,
    "removePoints": number or null,
    "potentialSavings": "Description of effort savings"
  }
}

Be specific, data-driven, and actionable. Reference actual feature names from the data.`;

    const userPrompt = `Analyse the following Epic data from the Spark Agile workspace and validate each feature's implementation status:\n\n${JSON.stringify(epicContext, null, 2)}\n\nProvide your implementation validation analysis as JSON.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds to your workspace.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('AI validation response received');

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ====== PERSIST VALIDATION RESULTS ======
    // Use service role ONLY for writes (inserts/updates) - reads used user context above
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      console.error('Service role key not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Create the validation run record
    const { data: validationRun, error: runError } = await supabaseAdmin
      .from('epic_validation_runs')
      .insert({
        epic_id: epicId,
        run_by: userId,
        status: 'pending_review',
        ai_summary: parsedResult.epicSummary,
        verdict_alignment: parsedResult.verdict?.alignment,
        verdict_summary: parsedResult.verdict?.summary,
        delivery_alignment_check: parsedResult.deliveryAlignmentCheck,
        effort_analysis: parsedResult.effortAnalysis || {},
        next_steps: parsedResult.nextSteps || [],
        features_analysed: features?.length || 0,
        dependencies_checked: dependencies?.length || 0,
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating validation run:', runError);
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Validation run created:', validationRun.id);

    // 2. Create per-item validation records and tag features
    const validationItems = parsedResult.validationItems || [];
    for (const item of validationItems) {
      const matchedFeature = featureMap.get(item.item?.toLowerCase()?.trim());
      
      const { error: itemError } = await supabaseAdmin
        .from('epic_validation_items')
        .insert({
          validation_run_id: validationRun.id,
          feature_id: matchedFeature?.id || null,
          item_name: item.item,
          current_status: item.status,
          ai_decision: item.decision,
          ai_reasoning: item.reasoning,
          ai_recommendation: item.recommendation,
        });

      if (itemError) {
        console.error('Error inserting validation item:', itemError);
      }

      // 3. Tag the feature with validation status
      if (matchedFeature) {
        const validationStatus = item.decision === 'implement' ? 'validated' 
          : item.decision === 'review' ? 'flagged' 
          : 'rejected';

        const { error: tagError } = await supabaseAdmin
          .from('features')
          .update({ 
            validation_status: validationStatus,
            validation_notes: item.reasoning,
          })
          .eq('id', matchedFeature.id);

        if (tagError) {
          console.error('Error tagging feature:', tagError);
        }
      }
    }

    // 4. Initialize default readiness checks for this epic
    const defaultChecks = [
      { check_type: 'dor_compliance', check_name: 'All features meet Definition of Ready' },
      { check_type: 'technical_dependency', check_name: 'Technical dependencies resolved' },
      { check_type: 'environment_ready', check_name: 'Dev/staging environments provisioned' },
      { check_type: 'api_ready', check_name: 'API contracts defined and available' },
      { check_type: 'data_ready', check_name: 'Data schemas and migrations ready' },
      { check_type: 'devops_ready', check_name: 'CI/CD pipelines configured' },
      { check_type: 'stakeholder_signoff', check_name: 'Stakeholder sign-off obtained' },
    ];

    for (const check of defaultChecks) {
      const { error: checkError } = await supabaseAdmin
        .from('epic_readiness_checks')
        .insert({
          epic_id: epicId,
          validation_run_id: validationRun.id,
          ...check,
        });
      if (checkError) console.error('Error creating readiness check:', checkError);
    }

    // 5. Audit log for service role operations
    await supabaseAdmin.from('sensitive_data_access_log').insert({
      user_id: userId,
      table_accessed: 'epic_validation_runs',
      access_type: 'service_role_write',
      query_context: `Epic validation run created: ${validationRun.id} for epic: ${epicId}`,
    });

    console.log('Validation workflow fully persisted for run:', validationRun.id);

    return new Response(
      JSON.stringify({
        success: true,
        validation: parsedResult,
        validationRunId: validationRun.id,
        metadata: {
          epicId,
          featuresAnalysed: features?.length || 0,
          dependenciesChecked: dependencies?.length || 0,
          validatedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Epic validation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Validation failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
