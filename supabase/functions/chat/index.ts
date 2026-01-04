import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

// Get client identifier from request (IP or user ID)
function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';
  return `ip:${ip}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let user = null;
    let tierName = 'Guest';
    let isPremium = false;

    // Try to authenticate if authorization header is provided
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      
      if (authUser) {
        user = authUser;
        
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

        tierName = subscriptionData?.subscription_tiers?.name || 'Free';
        isPremium = tierName !== 'Free' && tierName !== 'Guest';
        
        console.log(`Authenticated user ${user.id} tier: ${tierName}, isPremium: ${isPremium}`);
      }
    }

    // Get client identifier for rate limiting
    const clientId = getClientIdentifier(req, user?.id);

    // Rate limits: Guest: 3/min, Free: 5/min, Premium: 20/min
    const rateLimit = isPremium ? 20 : (user ? 5 : 3);
    if (!checkRateLimit(clientId, rateLimit, 60000)) {
      console.warn(`Rate limit exceeded for: ${clientId}`);
      const tierLabel = isPremium ? 'Premium' : (user ? 'Free' : 'Guest');
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. ${tierLabel} tier allows ${rateLimit} requests per minute.${!user ? ' Sign in for higher limits!' : (!isPremium ? ' Upgrade to Premium for higher limits!' : '')}` 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Chat request from ${clientId} with ${messages.length} messages`);

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

IMPORTANT: Do not use markdown formatting like asterisks or bold text in your responses. Write in plain, conversational text.

User Status: ${tierName} ${user ? '' : '(Not signed in)'}
${isPremium ? 'Premium features enabled: Priority support, unlimited workspaces, advanced analytics, custom integrations' : 
  user ? 'Free tier: Limited to 5 requests/min. Upgrade for premium features!' : 
  'Guest mode: Limited to 3 requests/min. Sign in for more features!'}

${!user ? `
Guest Mode Limitations:
- 3 AI requests per minute
- Basic platform guidance only
- Cannot access personalized features

Benefits of Signing Up (Free):
- 5 AI requests per minute
- Create your own workspace
- Track projects and tasks
- Access all platform features

Encourage guests to sign up when they ask about features requiring an account.
` : !isPremium ? `
Free Tier Limitations:
- 5 AI requests per minute (vs 20 for Premium)
- Basic workspace features only
- Standard support

Premium Benefits Available:
- 4x more AI requests (20/min)
- Unlimited project workspaces
- Advanced analytics and insights
- Priority support and faster responses
- Custom integration support
- Ceremony customization
- Team collaboration features

Mention upgrade benefits naturally when users ask about advanced features.
` : ''}

Your Expertise Includes:
- Agile methodologies, sprint planning techniques, and task management strategies
- Workspace initialization and configuration guidance
- Integration setup instructions (Microsoft Outlook, Teams, JIRA, GitHub)
- Scrum ceremony best practices and facilitation tips
- Team collaboration strategies and best practices

Workspace Creation Guidance:

When users ask about creating a workspace, guide them through:

1. Navigate to Workspace Setup: Go to Project Workspace or Initialization page
2. Enter Workspace Details: Name, description, sprint duration
3. Connect Microsoft Services (Optional but recommended):
   - Click "Connect to Outlook" for calendar integration
   - Click "Connect to Teams" for collaboration
   - You will be redirected to Microsoft login - sign in and authorize
4. Connect Development Tools:
   - JIRA: Enter your JIRA board URL and API token
   - GitHub: Enter repository URL and personal access token
5. Setup Teams Channel (if Microsoft connected): Create dedicated channel
6. Add Team Members: Invite collaborators with appropriate roles
7. Review and Complete: Verify all settings and finish setup

Common Setup Issues:
- Microsoft connection fails: Check Azure app permissions
- JIRA will not connect: Verify API token and board URL format
- GitHub issues: Ensure PAT has correct scopes (repo, read:org)
- Ceremonies not scheduling: Check Outlook calendar permissions

Ceremony Setup:
The platform can schedule these Scrum ceremonies:
- Sprint Planning (Monday, start of sprint, 2 hours)
- Daily Scrum (Daily during sprint, 15 minutes)
- Sprint Review (Last Friday of sprint, 1 hour)
- Sprint Retrospective (Last Friday after review, 1 hour)
- Backlog Refinement (Mid-sprint Wednesday, 1 hour)

Keep your answers clear, concise, and actionable. Provide step-by-step instructions when needed. Use plain text without special formatting.

${!user ? 'For guests, provide helpful guidance and encourage signing up for full platform access.' : 
  !isPremium ? 'For free tier users, keep responses focused and suggest premium features when relevant.' : 
  'Provide comprehensive guidance with full access to all platform features.'}`
          },
          ...messages,
        ],
        stream: true,
        max_tokens: isPremium ? 4000 : (user ? 1000 : 500), // Premium: 4000, Free: 1000, Guest: 500
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
