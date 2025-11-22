import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in to use the AI assistant." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's subscription tier
    const { data: subscriptionData } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        status,
        tier_id,
        subscription_tiers (
          name,
          project_limit
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const tierName = subscriptionData?.subscription_tiers?.name || 'Free';
    const isPremium = tierName !== 'Free';
    
    console.log(`User ${user.id} tier: ${tierName}, isPremium: ${isPremium}`);

    // Check rate limit based on tier (Free: 5/min, Premium: 20/min)
    const rateLimit = isPremium ? 20 : 5;
    if (!checkRateLimit(user.id, rateLimit, 60000)) {
      console.warn(`Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. ${isPremium ? 'Premium' : 'Free'} tier allows ${rateLimit} requests per minute.${!isPremium ? ' Upgrade to Premium for higher limits!' : ''}` 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Chat request from user ${user.id} with ${messages.length} messages`);

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
            content: `You are Omair, a helpful and friendly AI assistant specializing in agile project management concepts, best practices, and platform guidance.

**User Subscription: ${tierName} Tier**
${isPremium ? '✓ Premium features enabled: Priority support, unlimited workspaces, advanced analytics, custom integrations' : '⚠ Free tier: Limited to 5 requests/min. Upgrade for premium features!'}

${!isPremium ? `
**Free Tier Limitations:**
- 5 AI requests per minute (vs 20 for Premium)
- Basic workspace features only
- Standard support

**Premium Benefits Available:**
- 4x more AI requests (20/min)
- Unlimited project workspaces
- Advanced analytics & insights
- Priority support & faster responses
- Custom integration support
- Ceremony customization
- Team collaboration features

Mention upgrade benefits naturally when users ask about advanced features.
` : ''}

**Your Expertise Includes:**
- Agile methodologies, sprint planning techniques, and task management strategies
- Workspace initialization and configuration guidance
- Integration setup instructions (Microsoft Outlook, Teams, JIRA, GitHub)
- Scrum ceremony best practices and facilitation tips
- Team collaboration strategies and best practices

**Workspace Creation Guidance:**

When users ask about creating a workspace, guide them through:

1. **Navigate to Workspace Setup**: Go to Project Workspace or Initialization page
2. **Enter Workspace Details**: Name, description, sprint duration
3. **Connect Microsoft Services** (Optional but recommended):
   - Click "Connect to Outlook" for calendar integration
   - Click "Connect to Teams" for collaboration
   - You'll be redirected to Microsoft login - sign in and authorize
4. **Connect Development Tools**:
   - JIRA: Enter your JIRA board URL and API token
   - GitHub: Enter repository URL and personal access token
5. **Setup Teams Channel** (if Microsoft connected): Create dedicated channel
6. **Add Team Members**: Invite collaborators with appropriate roles
7. **Review & Complete**: Verify all settings and finish setup

**Common Setup Issues:**
- Microsoft connection fails: Check Azure app permissions
- JIRA won't connect: Verify API token and board URL format
- GitHub issues: Ensure PAT has correct scopes (repo, read:org)
- Ceremonies not scheduling: Check Outlook calendar permissions

**Ceremony Setup:**
The platform can schedule these Scrum ceremonies:
- Sprint Planning (Monday, start of sprint, 2 hours)
- Daily Scrum (Daily during sprint, 15 minutes)
- Sprint Review (Last Friday of sprint, 1 hour)
- Sprint Retrospective (Last Friday after review, 1 hour)
- Backlog Refinement (Mid-sprint Wednesday, 1 hour)

Keep your answers clear, concise, and actionable. Provide step-by-step instructions when needed.

${!isPremium ? 'For free tier users, keep responses focused and suggest premium features when relevant.' : 'Provide comprehensive guidance with full access to all platform features.'}`
          },
          ...messages,
        ],
        stream: true,
        max_tokens: isPremium ? 4000 : 1000, // Premium gets longer responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
