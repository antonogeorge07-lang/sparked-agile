import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, projectId, email, isTest } = await req.json();

    if (!userId || !projectId || !email) {
      throw new Error("Missing required fields: userId, projectId, email");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get project info
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    // Get recent completed items (wins)
    const { data: completedItems } = await supabase
      .from("native_backlog_items")
      .select("title, status")
      .eq("project_id", projectId)
      .eq("status", "done")
      .order("updated_at", { ascending: false })
      .limit(5);

    // Get blockers (risks)
    const { data: blockers } = await supabase
      .from("native_backlog_items")
      .select("title, priority")
      .eq("project_id", projectId)
      .eq("status", "blocked")
      .limit(5);

    // Get sprint data for metrics
    const { data: sprints } = await supabase
      .from("native_sprints")
      .select("name, velocity_completed, velocity_committed")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(3);

    // Get epic ROI data
    const { data: epicRoi } = await supabase
      .from("epic_roi_tracking")
      .select("roi_percentage, epics(title)")
      .order("roi_percentage", { ascending: false })
      .limit(3);

    // Generate AI insights using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiInsights = "";

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "You are an executive assistant providing brief, actionable project insights. Keep responses under 100 words."
              },
              {
                role: "user",
                content: `Analyze this project data and provide 2-3 key recommendations:
                  - Completed items: ${completedItems?.length || 0}
                  - Blockers: ${blockers?.length || 0}
                  - Recent velocity: ${sprints?.[0]?.velocity_completed || 0} points
                  - Previous velocity: ${sprints?.[1]?.velocity_completed || 0} points
                  Provide concise, actionable insights.`
              }
            ]
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiInsights = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("AI insights generation failed:", e);
      }
    }

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          .wins { color: #059669; }
          .risks { color: #dc2626; }
          .insights { color: #2563eb; }
          .metrics { color: #7c3aed; }
          ul { margin: 0; padding-left: 20px; }
          li { margin-bottom: 8px; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .metric { text-align: center; padding: 15px; background: #f1f5f9; border-radius: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #6366f1; }
          .metric-label { font-size: 12px; color: #64748b; }
          .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
          ${isTest ? '.test-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; font-weight: 600; }' : ''}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">📊 Executive Digest</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${project?.name || "Project"} Weekly Summary</p>
          </div>
          
          <div class="content">
            ${isTest ? '<div class="test-badge">🧪 Test Digest</div>' : ''}
            
            <div class="section">
              <div class="section-title wins">✅ Wins This Week</div>
              ${completedItems && completedItems.length > 0 
                ? `<ul>${completedItems.map(item => `<li>${item.title}</li>`).join('')}</ul>`
                : '<p style="color: #64748b;">No completed items this week</p>'
              }
            </div>
            
            <div class="section">
              <div class="section-title risks">⚠️ Risks & Blockers</div>
              ${blockers && blockers.length > 0 
                ? `<ul>${blockers.map(b => `<li><strong>[${b.priority}]</strong> ${b.title}</li>`).join('')}</ul>`
                : '<p style="color: #059669;">No active blockers - great progress!</p>'
              }
            </div>
            
            ${aiInsights ? `
            <div class="section">
              <div class="section-title insights">💡 AI Recommendations</div>
              <p>${aiInsights}</p>
            </div>
            ` : ''}
            
            <div class="section">
              <div class="section-title metrics">📈 Key Metrics</div>
              <div class="metric-grid">
                <div class="metric">
                  <div class="metric-value">${sprints?.[0]?.velocity_completed || 0}</div>
                  <div class="metric-label">Current Velocity</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${completedItems?.length || 0}</div>
                  <div class="metric-label">Items Completed</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${blockers?.length || 0}</div>
                  <div class="metric-label">Active Blockers</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Sent by SAAI - Your AI Chief of Staff</p>
            <p><a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/stakeholder-portal">View Full Dashboard</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(RESEND_API_KEY);
    const emailResult = await resend.emails.send({
      from: "SAAI Digest <onboarding@resend.dev>",
      to: [email],
      subject: `${isTest ? '[TEST] ' : ''}📊 Weekly Executive Digest - ${project?.name || 'Project'}`,
      html: emailHtml,
    });

    console.log("Digest email sent:", emailResult);

    // Update last_sent_at if not a test
    if (!isTest) {
      await supabase
        .from("digest_subscriptions")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("project_id", projectId);

      // Log to digest history
      await supabase.from("digest_history").insert({
        user_id: userId,
        project_id: projectId,
        digest_content: {
          wins: completedItems,
          blockers,
          metrics: sprints,
          aiInsights
        },
        ai_summary: aiInsights,
        delivery_status: "sent"
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: (emailResult as any).id || "sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending executive digest:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});