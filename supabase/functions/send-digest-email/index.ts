import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { email, digest }: DigestEmailRequest = await req.json();

    if (!email || !digest) {
      throw new Error("Email and digest data are required");
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Daily Digest - ${digest.date}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background-color: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 20px; color: #1e293b;">
        📊 GitHub Daily Digest
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
        <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${digest.repo}</code>
        &nbsp;•&nbsp; ${digest.date}
      </p>
    </div>

    <!-- Completed Section -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 14px; color: #166534; display: flex; align-items: center;">
        ✅ Completed
      </h2>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">
${digest.summary.done}
      </p>
    </div>

    <!-- Blocked Section -->
    <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 14px; color: #9a3412; display: flex; align-items: center;">
        ⚠️ Pending / Blocked
      </h2>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">
${digest.summary.blocked}
      </p>
    </div>

    <!-- Focus Section -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af; display: flex; align-items: center;">
        🎯 Focus Today
      </h2>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">
${digest.summary.focus}
      </p>
    </div>

    <!-- Footer -->
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
      subject: `📊 GitHub Daily Digest - ${digest.repo} (${digest.date})`,
      html: htmlContent,
    });

    console.log("Digest email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-digest-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
