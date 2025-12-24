-- Enhanced Cost Data Protection for AI Usage Logs
-- Drop existing functions first to allow return type changes
DROP FUNCTION IF EXISTS public.get_my_ai_usage_summary();
DROP FUNCTION IF EXISTS public.get_aggregated_ai_usage_stats(TIMESTAMPTZ, TIMESTAMPTZ);

-- Recreate user summary function without cost/token exposure
CREATE OR REPLACE FUNCTION public.get_my_ai_usage_summary()
RETURNS TABLE(
  total_requests BIGINT,
  last_used TIMESTAMPTZ,
  monthly_requests BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_requests,
    MAX(created_at) as last_used,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::BIGINT as monthly_requests
  FROM ai_usage_logs
  WHERE user_id = auth.uid();
END;
$$;

-- Create rate-limited aggregation access tracking
CREATE TABLE IF NOT EXISTS public.aggregation_access_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  access_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, function_name, window_start)
);

ALTER TABLE public.aggregation_access_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view aggregation limits" ON public.aggregation_access_limits;
CREATE POLICY "Admins can view aggregation limits"
  ON public.aggregation_access_limits FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "System can manage limits" ON public.aggregation_access_limits;
CREATE POLICY "System can manage limits"
  ON public.aggregation_access_limits FOR INSERT WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.aggregation_access_limits FROM anon, public;
GRANT ALL ON public.aggregation_access_limits TO authenticated;

-- Rate-limited aggregation function WITHOUT cost data
CREATE OR REPLACE FUNCTION public.get_aggregated_ai_usage_stats(
  start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(
  period DATE,
  total_requests BIGINT,
  unique_users BIGINT,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  current_access_count INTEGER;
  max_daily_queries CONSTANT INTEGER := 10;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT COALESCE(SUM(aal.access_count), 0) INTO current_access_count
  FROM aggregation_access_limits aal
  WHERE aal.user_id = auth.uid()
  AND aal.function_name = 'get_aggregated_ai_usage_stats'
  AND aal.window_start = date_trunc('day', now());

  IF current_access_count >= max_daily_queries THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum % queries per day', max_daily_queries;
  END IF;

  INSERT INTO aggregation_access_limits (user_id, function_name, access_count, window_start)
  VALUES (auth.uid(), 'get_aggregated_ai_usage_stats', 1, date_trunc('day', now()))
  ON CONFLICT (user_id, function_name, window_start) 
  DO UPDATE SET access_count = aggregation_access_limits.access_count + 1;

  INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
  VALUES (auth.uid(), 'ai_usage_logs', 'aggregated_read', 
    format('Query %s of %s today', current_access_count + 1, max_daily_queries));

  RETURN QUERY
  SELECT 
    DATE(created_at) as period,
    COUNT(*)::BIGINT as total_requests,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) as success_rate
  FROM ai_usage_logs
  WHERE created_at >= start_date AND created_at <= end_date
  GROUP BY DATE(created_at)
  ORDER BY period DESC
  LIMIT 90;
END;
$$;

-- Platform owner only cost analytics
CREATE OR REPLACE FUNCTION public.get_platform_cost_analytics(
  start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(period DATE, total_cost NUMERIC, avg_cost_per_request NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = 'antono.george07@gmail.com') THEN
    RAISE EXCEPTION 'Unauthorized: Platform owner access required';
  END IF;

  INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
  VALUES (auth.uid(), 'ai_usage_logs', 'cost_analytics', format('Cost data: %s to %s', start_date, end_date));

  RETURN QUERY
  SELECT DATE(created_at), ROUND(COALESCE(SUM(cost_estimate), 0)::NUMERIC, 4),
    ROUND(COALESCE(AVG(cost_estimate), 0)::NUMERIC, 6)
  FROM ai_usage_logs WHERE created_at >= start_date AND created_at <= end_date
  GROUP BY DATE(created_at) ORDER BY 1 DESC LIMIT 90;
END;
$$;

-- Sanitized view hiding costs
DROP VIEW IF EXISTS public.ai_usage_logs_sanitized;
CREATE VIEW public.ai_usage_logs_sanitized 
WITH (security_invoker = true) AS
SELECT id, user_id, project_id, model, endpoint, status, created_at
FROM ai_usage_logs WHERE auth.uid() = user_id;

GRANT EXECUTE ON FUNCTION public.get_my_ai_usage_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_aggregated_ai_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_cost_analytics TO authenticated;