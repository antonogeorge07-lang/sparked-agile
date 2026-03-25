import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate caller: either service role key or cron secret
    const authHeader = req.headers.get('Authorization');
    const cronSecret = req.headers.get('x-cron-secret');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');

    const isServiceRole = authHeader === `Bearer ${serviceRoleKey}`;
    const isCronCaller = cronSecret && expectedCronSecret && cronSecret === expectedCronSecret;

    if (!isServiceRole && !isCronCaller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey!, {
      auth: { persistSession: false },
    });

    const results: Record<string, any> = {};

    // 1. Clean expired integration cache
    const { data: cacheResult } = await supabase.rpc('cleanup_expired_cache');
    results.expired_cache_cleaned = cacheResult ?? 0;

    // 2. Clean old access logs (90-day retention)
    const { data: logsResult } = await supabase.rpc('cleanup_old_access_logs', { days_to_keep: 90 });
    results.old_logs_cleaned = logsResult ?? 0;

    // 3. Anonymise old AI usage logs (90-day retention)
    const { data: aiResult } = await supabase.rpc('anonymize_old_ai_usage_logs');
    results.ai_logs_anonymised = aiResult ?? 0;

    // 4. Clean old rate limit tracking entries
    const { error: rateLimitError } = await supabase
      .from('aggregation_access_limits')
      .delete()
      .lt('window_start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    results.rate_limit_entries_cleaned = !rateLimitError;

    // 5. Clean dismissed smart nudges older than 30 days
    const { error: nudgesError } = await supabase
      .from('smart_nudges')
      .delete()
      .eq('is_dismissed', true)
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    results.old_nudges_cleaned = !nudgesError;

    // 6. Clean old chat rate limit entries (older than 1 hour)
    const { data: chatRateLimitResult } = await supabase.rpc('cleanup_chat_rate_limits');
    results.chat_rate_limits_cleaned = chatRateLimitResult ?? 0;

    console.log('Scheduled cleanup completed:', results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(JSON.stringify({ error: 'Cleanup failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
