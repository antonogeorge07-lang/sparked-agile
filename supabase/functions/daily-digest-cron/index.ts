// Daily digest dispatcher. Triggered by pg_cron at 08:00 UTC.
// Iterates over active digest subscriptions and invokes send-executive-digest
// for each. Requires CRON_SECRET header to prevent abuse.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require CRON_SECRET to invoke
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret =
      req.headers.get("x-cron-secret") ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    if (cronSecret && providedSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const currentHour = new Date().getUTCHours();

    // Find active daily subscriptions due for this hour
    const { data: subs, error } = await admin
      .from("digest_subscriptions")
      .select("id, user_id, project_id, email_address, digest_type, delivery_hour, last_sent_at")
      .eq("is_active", true)
      .eq("digest_type", "daily")
      .eq("delivery_hour", currentHour);

    if (error) throw error;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subs || []) {
      try {
        // Skip if already sent in last 20 hours (idempotency)
        if (sub.last_sent_at) {
          const last = new Date(sub.last_sent_at).getTime();
          if (Date.now() - last < 20 * 60 * 60 * 1000) continue;
        }

        const res = await fetch(
          `${supabaseUrl}/functions/v1/send-executive-digest`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              userId: sub.user_id,
              projectId: sub.project_id,
              email: sub.email_address,
            }),
          },
        );

        if (!res.ok) {
          failed++;
          errors.push(`sub ${sub.id}: ${res.status}`);
          continue;
        }

        await admin
          .from("digest_subscriptions")
          .update({ last_sent_at: new Date().toISOString() })
          .eq("id", sub.id);

        sent++;
      } catch (err) {
        failed++;
        errors.push(`sub ${sub.id}: ${(err as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, total: subs?.length || 0, errors }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
