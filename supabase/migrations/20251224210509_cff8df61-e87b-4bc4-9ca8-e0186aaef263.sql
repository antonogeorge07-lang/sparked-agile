-- Enhanced Security for AI Usage Logs
-- 1. Add data retention: auto-anonymize records older than 90 days
-- 2. Create secure aggregation functions instead of raw data access
-- 3. Add audit logging for sensitive data access

-- Create audit log table for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_accessed TEXT NOT NULL,
  access_type TEXT NOT NULL,
  query_context TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view access logs"
  ON public.sensitive_data_access_log
  FOR SELECT
  USING (is_admin(auth.uid()));

-- System can insert audit logs (via functions)
CREATE POLICY "System can insert access logs"
  ON public.sensitive_data_access_log
  FOR INSERT
  WITH CHECK (true);

-- Revoke direct access to prevent bypassing
REVOKE ALL ON public.sensitive_data_access_log FROM anon;
REVOKE ALL ON public.sensitive_data_access_log FROM public;
GRANT SELECT ON public.sensitive_data_access_log TO authenticated;
GRANT INSERT ON public.sensitive_data_access_log TO authenticated;

-- Secure function for aggregated AI usage stats (no raw data exposure)
CREATE OR REPLACE FUNCTION public.get_aggregated_ai_usage_stats(
  start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(
  period DATE,
  total_requests BIGINT,
  total_tokens BIGINT,
  unique_users BIGINT,
  avg_tokens_per_request NUMERIC,
  success_rate NUMERIC,
  estimated_cost NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Only admins can access aggregated stats
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Log the access
  INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
  VALUES (auth.uid(), 'ai_usage_logs', 'aggregated_read', 
    format('Date range: %s to %s', start_date, end_date));

  RETURN QUERY
  SELECT 
    DATE(created_at) as period,
    COUNT(*)::BIGINT as total_requests,
    COALESCE(SUM(tokens_used), 0)::BIGINT as total_tokens,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    ROUND(AVG(tokens_used)::NUMERIC, 2) as avg_tokens_per_request,
    ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) as success_rate,
    ROUND(COALESCE(SUM(cost_estimate), 0)::NUMERIC, 4) as estimated_cost
  FROM ai_usage_logs
  WHERE created_at >= start_date AND created_at <= end_date
  GROUP BY DATE(created_at)
  ORDER BY period DESC;
END;
$$;

-- Function for users to see their own usage summary (not raw data)
CREATE OR REPLACE FUNCTION public.get_my_ai_usage_summary()
RETURNS TABLE(
  total_requests BIGINT,
  total_tokens BIGINT,
  last_used TIMESTAMPTZ,
  monthly_tokens BIGINT,
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
    COALESCE(SUM(tokens_used), 0)::BIGINT as total_tokens,
    MAX(created_at) as last_used,
    COALESCE(SUM(tokens_used) FILTER (WHERE created_at >= date_trunc('month', now())), 0)::BIGINT as monthly_tokens,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::BIGINT as monthly_requests
  FROM ai_usage_logs
  WHERE user_id = auth.uid();
END;
$$;

-- Data retention: function to anonymize old records
CREATE OR REPLACE FUNCTION public.anonymize_old_ai_usage_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Only allow admins or system to run this
  IF auth.uid() IS NOT NULL AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Anonymize records older than 90 days
  -- Keep aggregated data but remove user association
  WITH anonymized AS (
    UPDATE ai_usage_logs
    SET 
      user_id = '00000000-0000-0000-0000-000000000000'::UUID,
      project_id = NULL,
      error_message = NULL
    WHERE created_at < now() - INTERVAL '90 days'
    AND user_id != '00000000-0000-0000-0000-000000000000'::UUID
    RETURNING 1
  )
  SELECT COUNT(*) INTO affected_rows FROM anonymized;

  -- Log the anonymization
  IF affected_rows > 0 THEN
    INSERT INTO sensitive_data_access_log (
      user_id, 
      table_accessed, 
      access_type, 
      query_context
    )
    VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      'ai_usage_logs',
      'data_anonymization',
      format('Anonymized %s records older than 90 days', affected_rows)
    );
  END IF;

  RETURN affected_rows;
END;
$$;

-- Update the existing RLS policy to be more restrictive
-- Drop the existing "Only platform owner can view AI usage" policy
DROP POLICY IF EXISTS "Only platform owner can view AI usage" ON ai_usage_logs;

-- Create more restrictive policy: only through secure functions
-- Users can only see their own raw data (for debugging), admins use aggregation
CREATE POLICY "Users can view own AI usage for debugging"
  ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at 
  ON ai_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created 
  ON ai_usage_logs(user_id, created_at);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_aggregated_ai_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_ai_usage_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_old_ai_usage_logs TO authenticated;