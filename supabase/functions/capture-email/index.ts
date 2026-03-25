import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface CaptureEmailRequest {
  email: string;
  name: string;
  context: "early_access" | "newsletter" | "beta" | "exit_intent";
}

// Rate limiting: max 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

const contextConfig = {
  early_access: {
    subject: "Welcome to Spark-Agile Early Access! 🚀",
    heading: "You're on the Early Access List!",
    message: "Thank you for joining our early access programme. You'll be among the first to try new features and get 3 months free Pro plan when we launch.",
    cta: "We'll notify you as soon as new features are available."
  },
  newsletter: {
    subject: "Welcome to the Spark-Agile Newsletter! 📧",
    heading: "You're Subscribed!",
    message: "Thank you for subscribing to our newsletter. You'll receive weekly productivity tips, agile best practices, and platform updates.",
    cta: "Look out for our next edition in your inbox!"
  },
  beta: {
    subject: "Welcome to the Spark-Agile Beta Programme! 🎯",
    heading: "You're a Beta Tester!",
    message: "Thank you for joining our beta programme. As a beta tester, you'll get free lifetime Pro access and help shape the future of Spark-Agile.",
    cta: "We'll reach out soon with exclusive access details."
  },
  exit_intent: {
    subject: "Let's Get You Started with Spark-Agile! 🎉",
    heading: "Thanks for Your Interest!",
    message: "We'd love to show you how Spark-Agile can transform your team's workflow. Our team will reach out to schedule a personalised demo.",
    cta: "Expect to hear from us within 24 hours!"
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Received email capture request");
    const { email, name, context }: CaptureEmailRequest = await req.json();

    // Validate inputs
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!name || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const validContexts = ["early_access", "newsletter", "beta", "exit_intent"];
    if (!context || !validContexts.includes(context)) {
      return new Response(
        JSON.stringify({ error: "Invalid context" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const displayName = escapeHtml(name.trim());
    const config = contextConfig[context];

    // Store in database (optional - for lead tracking)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("landing_feedback").insert({
        email: email.toLowerCase().trim(),
        name: displayName,
        context,
        captured_at: new Date().toISOString()
      });
      console.log("Email capture stored in database");
    } catch (dbError) {
      // Continue even if DB insert fails - email is more important
      console.log("Note: Could not store in database (table may not exist):", dbError);
    }

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "SAAI <onboarding@resend.dev>",
      to: [email],
      subject: config.subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #ffffff; padding: 40px 30px; }
              .message-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
              .cta-box { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
              .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${config.heading}</h1>
              </div>
              
              <div class="content">
                <p style="font-size: 18px;">Hi ${displayName}! 👋</p>
                
                <p style="font-size: 16px;">${config.message}</p>
                
                <div class="message-box">
                  <p style="margin: 0; font-size: 15px;"><strong>What's next?</strong></p>
                  <p style="margin: 10px 0 0 0; font-size: 15px;">${config.cta}</p>
                </div>
                
                <div class="cta-box">
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">In the meantime, check out what SAAI can do:</p>
                  <a href="https://saai.lovable.app" class="button">Explore SAAI</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">Questions? Just reply to this email - we're here to help!</p>
              </div>
              
              <div class="footer">
                <p style="margin: 0;">© 2025 SAAI. Stay informed, effortlessly.</p>
                <p style="margin: 10px 0 0 0; font-size: 12px;">
                  <a href="https://saai.lovable.app" style="color: #10b981; text-decoration: none;">saai.lovable.app</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email captured and confirmation sent",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in capture-email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
