import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Escape HTML to prevent XSS attacks in email content
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
}

// Rate limiting: max 3 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 3;

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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

    console.log("Received welcome email request");
    const { email, firstName }: WelcomeEmailRequest = await req.json();

    if (!email) {
      console.error("Email is required");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const displayName = escapeHtml(firstName || "there");

    const emailResponse = await resend.emails.send({
      from: "SAAI Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to SAAI - Your Account is Pending Approval",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .resource-list { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .resource-item { margin: 10px 0; padding-left: 20px; position: relative; }
              .resource-item:before { content: "→"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
              h2 { color: #1f2937; margin-top: 0; }
              h3 { color: #374151; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to SAAI Platform! 🎉</h1>
              </div>
              
              <div class="content">
                <p>Hi ${displayName},</p>
                
                <p>Thank you for registering with SAAI Platform! We're excited to have you join our community of agile practitioners and project managers.</p>
                
                <div class="info-box">
                  <strong>📋 Account Status:</strong> Your account is currently pending admin approval. You'll receive another email once your account has been approved and you can access all features.
                </div>
                
                <h2>🚀 What You Can Do Now</h2>
                <p>While you wait for approval, you can:</p>
                <div class="resource-list">
                  <div class="resource-item">Explore demo features and sample data</div>
                  <div class="resource-item">Review our comprehensive User Guide</div>
                  <div class="resource-item">Learn about available Scrum ceremonies</div>
                  <div class="resource-item">Check out the FAQ section</div>
                  <div class="resource-item">Familiarize yourself with the Project Command Centre</div>
                </div>
                
                <h2>📚 Helpful Resources</h2>
                <h3>Getting Started:</h3>
                <div class="resource-list">
                  <div class="resource-item"><strong>User Guide:</strong> Comprehensive documentation covering all platform features</div>
                  <div class="resource-item"><strong>FAQ:</strong> Answers to common questions about account approval, features, and workflows</div>
                  <div class="resource-item"><strong>Demo Mode:</strong> Try out features with sample data before your approval</div>
                </div>
                
                <h3>Key Features You'll Access:</h3>
                <div class="resource-list">
                  <div class="resource-item"><strong>Sprint Planning Assistant:</strong> AI-powered sprint planning and backlog management</div>
                  <div class="resource-item"><strong>Project Command Centre:</strong> Create and manage projects with task tracking</div>
                  <div class="resource-item"><strong>Scrum Ceremonies:</strong> Automated standup, retrospective, sprint review, and backlog refinement</div>
                  <div class="resource-item"><strong>Team Management:</strong> Invite team members and manage project access</div>
                  <div class="resource-item"><strong>Integration Hub:</strong> Connect with Jira, GitHub, and Microsoft tools</div>
                </div>
                
                <h2>⏰ What Happens Next?</h2>
                <ol>
                  <li>An admin will review your registration</li>
                  <li>You'll receive an approval notification email (usually within 24-48 hours)</li>
                  <li>Once approved, you can create projects and invite team members</li>
                  <li>Start automating your Scrum ceremonies and workflows!</li>
                </ol>
                
                <div class="info-box" style="background: #dbeafe; border-left-color: #3b82f6;">
                  <strong>💡 Pro Tip:</strong> Use this time to explore the platform and plan how you'll structure your first project. Review the User Guide to understand all available features.
                </div>
                
                <p style="margin-top: 30px;">If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                  <p style="margin-bottom: 5px;">Best regards,</p>
                  <p style="margin: 5px 0; font-weight: bold; font-size: 16px; color: #667eea;">The SAAI Platform Team</p>
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Agile Delivery Excellence</p>
                <p style="margin: 10px 0; font-size: 14px;">
                    <a href="mailto:Antono.George1@outlook.com" style="color: #667eea; text-decoration: none;">Antono.George1@outlook.com</a>
                  </p>
                  <p style="margin: 5px 0; font-size: 13px; color: #9ca3af;">
                    📧 Questions? Visit our <a href="https://saai.lovable.app/faq" style="color: #667eea; text-decoration: none;">Help Center</a> or reply to this email
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2025 SAAI Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send welcome email",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
