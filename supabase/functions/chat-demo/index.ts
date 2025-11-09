import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced rate limiter with fingerprinting for demo
interface RateLimitEntry {
  count: number;
  fingerprint: string;
  lastRequest: number;
}

const demoLimitMap = new Map<string, RateLimitEntry>();

// Generate client fingerprint from multiple headers
function generateFingerprint(req: Request): string {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "";
  const acceptLang = req.headers.get("accept-language") || "";
  const accept = req.headers.get("accept") || "";
  
  // Create composite fingerprint
  return `${ip}:${userAgent.substring(0, 50)}:${acceptLang}:${accept.substring(0, 30)}`;
}

function checkDemoLimit(req: Request): { allowed: boolean; remaining: number } {
  const fingerprint = generateFingerprint(req);
  const now = Date.now();
  const MAX_REQUESTS = 3;
  const RESET_AFTER = 24 * 60 * 60 * 1000; // 24 hours
  
  let entry = demoLimitMap.get(fingerprint);
  
  // Reset if 24 hours have passed
  if (entry && (now - entry.lastRequest) > RESET_AFTER) {
    entry = undefined;
  }
  
  if (!entry) {
    entry = { count: 0, fingerprint, lastRequest: now };
  }
  
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  entry.lastRequest = now;
  demoLimitMap.set(fingerprint, entry);
  
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

// Input validation
function validateChatInput(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  if (!Array.isArray(data.messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }
  
  if (data.messages.length === 0 || data.messages.length > 20) {
    return { valid: false, error: 'Messages count must be between 1 and 20' };
  }
  
  for (const msg of data.messages) {
    if (!msg.role || !msg.content) {
      return { valid: false, error: 'Each message must have role and content' };
    }
    if (typeof msg.content !== 'string' || msg.content.length > 5000) {
      return { valid: false, error: 'Message content must be string under 5000 chars' };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check demo limit with enhanced fingerprinting
    const limitCheck = checkDemoLimit(req);
    
    if (!limitCheck.allowed) {
      console.warn(`Demo limit exceeded for fingerprint`);
      return new Response(
        JSON.stringify({ 
          error: "Demo limit reached. Sign up for unlimited access!",
          remaining: 0
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const validation = validateChatInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { messages } = requestData;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Demo chat request with ${messages.length} messages, ${limitCheck.remaining} remaining`);

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
            content: "You are Omair, a helpful and friendly AI assistant specializing in project management. You help users with agile methodologies, sprint planning, task management, team collaboration, and using the SAAI platform. Keep your answers clear, concise, and actionable. This is a demo conversation - the user has limited questions, so provide valuable, focused answers."
          },
          ...messages,
        ],
        stream: true,
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
