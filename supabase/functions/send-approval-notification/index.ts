import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, action, reason } = await req.json();

    if (!requestId || !action) {
      throw new Error("Missing required fields: requestId, action");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get approval request details
    const { data: request, error: requestError } = await supabase
      .from("approval_requests")
      .select(`
        *,
        projects(name)
      `)
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      throw new Error("Approval request not found");
    }

    // Get requester email from profiles
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", request.requester_id)
      .single();

    if (!requesterProfile?.email) {
      console.log("No email found for requester, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    const isApproved = action === "approved";
    const statusColor = isApproved ? "#059669" : "#dc2626";
    const statusIcon = isApproved ? "✅" : "❌";
    const statusText = isApproved ? "Approved" : "Rejected";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .value { font-size: 16px; font-weight: 500; }
          .reason { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 48px;">${statusIcon}</div>
            <h1 style="margin: 10px 0 0 0; font-size: 24px;">Request ${statusText}</h1>
          </div>
          
          <div class="content">
            <div class="details">
              <div style="margin-bottom: 15px;">
                <div class="label">Request</div>
                <div class="value">${request.title}</div>
              </div>
              <div style="margin-bottom: 15px;">
                <div class="label">Project</div>
                <div class="value">${request.projects?.name || "N/A"}</div>
              </div>
              <div style="margin-bottom: 15px;">
                <div class="label">Type</div>
                <div class="value">${request.request_type.replace("_", " ").toUpperCase()}</div>
              </div>
              <div>
                <div class="label">Status</div>
                <div class="value" style="color: ${statusColor};">${statusText}</div>
              </div>
            </div>
            
            ${!isApproved && reason ? `
            <div class="reason">
              <div class="label">Rejection Reason</div>
              <p style="margin: 8px 0 0 0;">${reason}</p>
            </div>
            ` : ''}
            
            ${isApproved ? `
            <p style="color: #059669;">Your request has been approved and the changes will take effect.</p>
            ` : `
            <p style="color: #64748b;">If you have questions about this decision, please contact your project stakeholder.</p>
            `}
          </div>
          
          <div class="footer">
            <p>Sent by SAAI - Approval Workflow</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await resend.emails.send({
      from: "SAAI <onboarding@resend.dev>",
      to: [requesterProfile.email],
      subject: `${statusIcon} Your request "${request.title}" was ${statusText.toLowerCase()}`,
      html: emailHtml,
    });

    console.log("Approval notification sent:", emailResult);

    // Update email_sent_at
    await supabase
      .from("approval_requests")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", requestId);

    return new Response(JSON.stringify({ success: true, emailId: (emailResult as any).id || "sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending approval notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});