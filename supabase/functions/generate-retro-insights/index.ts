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

    // Rate limiting: 10 requests per minute for AI functions
    const rateLimiter = new Map<string, { count: number; resetAt: number }>();
    const now = Date.now();
    const userLimit = rateLimiter.get(user.id);
    
    if (!userLimit || now > userLimit.resetAt) {
      rateLimiter.set(user.id, { count: 1, resetAt: now + 60000 });
    } else if (userLimit.count >= 10) {
      const waitSeconds = Math.ceil((userLimit.resetAt - now) / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${waitSeconds} seconds`);
    } else {
      userLimit.count++;
    }

    // Input validation
    const { feedback, projectId } = await req.json();
    
    if (!feedback || !Array.isArray(feedback)) {
      throw new Error('Invalid input: feedback must be an array');
    }

    if (feedback.length === 0) {
      throw new Error('No feedback provided');
    }

    if (feedback.length > 100) {
      throw new Error('Too much feedback (max 100 items)');
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

    console.log("Generating retrospective insights from", feedback.length, "feedback items");

    const feedbackText = feedback.map((item: any, index: number) =>
      `Feedback ${index + 1}:\n- What went well: ${item.wentWell}\n- What could improve: ${item.improve}\n- Action items: ${item.actionItems || 'None suggested'}`
    ).join('\n\n');

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
            content: "You are a Scrum Master assistant analyzing retrospective feedback. Identify patterns, themes, and actionable insights to help teams improve."
          },
          {
            role: "user",
            content: `Analyze this sprint retrospective feedback and provide:\n\n${feedbackText}\n\n1. Top 3 positive themes (what worked well)\n2. Top 3 areas for improvement\n3. 3-5 specific, actionable recommendations\n4. Overall team health assessment`
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
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-retro-insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
