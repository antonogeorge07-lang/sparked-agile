import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface DigestSummary {
  done: string;
  blocked: string;
  focus: string;
}

interface DigestEmailRequest {
  email: string;
  digest: {
    repo: string;
    date: string;
    summary: DigestSummary;
    raw_count: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated user — prevents abuse of the email-sending endpoint
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerEmail = userData.user.email;

    const { email, digest }: DigestEmailRequest = await req.json();

    if (!email || !digest) {
      throw new Error("Email and digest data are required");
    }

    // Only allow sending to the authenticated user's own email
    if (callerEmail && email.toLowerCase() !== callerEmail.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "May only send digest to your own email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeRepo = escapeHtml(digest.repo);
    const safeDate = escapeHtml(digest.date);
    const safeDone = escapeHtml(digest.summary.done);
    const safeBlocked = escapeHtml(digest.summary.blocked);
    const safeFocus = escapeHtml(digest.summary.focus);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Daily Digest - ${safeDate}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background-color: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 20px; color: #1e293b;">📊 GitHub Daily Digest</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${safeRepo}</code>
        &nbsp;•&nbsp; ${safeDate}
      </p>
    </div>
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 14px; color: #166534;">✅ Completed</h2>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${safeDone}</p>
    </div>
    <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 14px; color: #9a3412;">⚠️ Pending / Blocked</h2>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${safeBlocked}</p>
    </div>
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af;">🎯 Focus Today</h2>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${safeFocus}</p>
    </div>
    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
        ${digest.raw_count} events analyzed • Powered by SM-ActiveIntelligence
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "SM-ActiveIntelligence <onboarding@resend.dev>",
      to: [email],
      subject: `📊 GitHub Daily Digest - ${safeRepo} (${safeDate})`,
      html: htmlContent,
    });

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-digest-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
