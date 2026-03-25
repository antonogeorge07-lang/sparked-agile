import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require service role key or internal cron secret
    const authHeader = req.headers.get("authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET") || "";

    const isServiceRole = authHeader === `Bearer ${serviceRoleKey}`;
    const isCronAuth = cronSecret && req.headers.get("x-cron-secret") === cronSecret;

    if (!isServiceRole && !isCronAuth) {
      console.warn("Unauthorized deliver-webhooks attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use service role for processing webhooks
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log("Processing pending webhook deliveries...");

    // Get pending webhook deliveries with webhook details
    const { data: pendingDeliveries, error: fetchError } = await supabase
      .from("webhook_deliveries")
      .select(`
        id,
        webhook_id,
        event_type,
        payload,
        attempt_count,
        webhooks(
          url,
          secret,
          is_active
        )
      `)
      .eq("status", "pending")
      .lt("attempt_count", 3)
      .limit(50);

    if (fetchError) {
      console.error("Error fetching pending deliveries:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pendingDeliveries || pendingDeliveries.length === 0) {
      console.log("No pending deliveries to process");
      return new Response(
        JSON.stringify({ message: "No pending deliveries", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pendingDeliveries.length} deliveries`);

    let successCount = 0;
    let failCount = 0;

    for (const delivery of pendingDeliveries) {
      const webhook = (delivery as any).webhooks;
      
      if (!webhook || !webhook.is_active) {
        // Mark as failed if webhook is inactive
        await supabase
          .from("webhook_deliveries")
          .update({ 
            status: "failed",
            response_body: "Webhook is inactive or not found"
          })
          .eq("id", delivery.id);
        failCount++;
        continue;
      }

      try {
        const payload = JSON.stringify(delivery.payload);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Webhook-Event": delivery.event_type,
          "X-Webhook-Delivery": delivery.id,
        };

        // Sign payload if secret is set
        if (webhook.secret) {
          const signature = createHmac("sha256", webhook.secret)
            .update(payload)
            .digest("hex");
          headers["X-Webhook-Signature"] = `sha256=${signature}`;
        }

        console.log(`Delivering to ${webhook.url} for event ${delivery.event_type}`);

        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: payload,
        });

        const responseBody = await response.text().catch(() => "");

        if (response.ok) {
          // Success
          await supabase
            .from("webhook_deliveries")
            .update({
              status: "delivered",
              response_status: response.status,
              response_body: responseBody.substring(0, 1000),
              delivered_at: new Date().toISOString(),
            })
            .eq("id", delivery.id);
          successCount++;
          console.log(`Successfully delivered ${delivery.id}`);
        } else {
          // Failed but might retry
          const newAttempt = delivery.attempt_count + 1;
          await supabase
            .from("webhook_deliveries")
            .update({
              status: newAttempt >= 3 ? "failed" : "pending",
              response_status: response.status,
              response_body: responseBody.substring(0, 1000),
              attempt_count: newAttempt,
            })
            .eq("id", delivery.id);
          failCount++;
          console.log(`Failed to deliver ${delivery.id}, attempt ${newAttempt}`);
        }
      } catch (deliveryError) {
        console.error(`Error delivering ${delivery.id}:`, deliveryError);
        const newAttempt = delivery.attempt_count + 1;
        await supabase
          .from("webhook_deliveries")
          .update({
            status: newAttempt >= 3 ? "failed" : "pending",
            response_body: String(deliveryError).substring(0, 1000),
            attempt_count: newAttempt,
          })
          .eq("id", delivery.id);
        failCount++;
      }
    }

    console.log(`Processed: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Webhook delivery completed",
        processed: pendingDeliveries.length,
        success: successCount,
        failed: failCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook delivery error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
