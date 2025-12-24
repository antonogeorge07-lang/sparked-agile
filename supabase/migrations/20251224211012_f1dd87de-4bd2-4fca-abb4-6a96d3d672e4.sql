-- Secure AI Usage Patterns from Business Intelligence Exposure

-- 1. Revoke direct access to ai_usage_logs table - force use of sanitized view
REVOKE SELECT ON public.ai_usage_logs FROM authenticated;
REVOKE ALL ON public.ai_usage_logs FROM anon, public;

-- Only allow INSERT for logging (users can log their own usage)
GRANT INSERT ON public.ai_usage_logs TO authenticated;

-- 2. Create secure function for users to view their own usage (replaces direct access)
CREATE OR REPLACE FUNCTION public.get_my_recent_ai_usage(
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  model TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  query_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 10 queries per hour to prevent harvesting
  SELECT COUNT(*) INTO query_count
  FROM sensitive_data_access_log
  WHERE user_id = auth.uid()
  AND table_accessed = 'ai_usage_logs'
  AND access_type = 'user_self_query'
  AND created_at > now() - INTERVAL '1 hour';

  IF query_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 usage queries per hour';
  END IF;

  -- Log the access
  INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
  VALUES (auth.uid(), 'ai_usage_logs', 'user_self_query', format('Limit: %s', limit_count));

  -- Return limited, sanitized data (no tokens, costs, endpoints, project_id)
  RETURN QUERY
  SELECT 
    a.id,
    a.model,
    a.status,
    a.created_at
  FROM ai_usage_logs a
  WHERE a.user_id = auth.uid()
  ORDER BY a.created_at DESC
  LIMIT LEAST(limit_count, 50); -- Cap at 50 records max
END;
$$;

-- 3. Create harvesting detection trigger
CREATE OR REPLACE FUNCTION public.detect_data_harvesting()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  recent_queries INTEGER;
  distinct_tables INTEGER;
BEGIN
  -- Check for suspicious query patterns (>50 queries in 10 minutes across multiple tables)
  SELECT COUNT(*), COUNT(DISTINCT table_accessed)
  INTO recent_queries, distinct_tables
  FROM sensitive_data_access_log
  WHERE user_id = NEW.user_id
  AND created_at > now() - INTERVAL '10 minutes';

  -- Flag as potential harvesting attempt
  IF recent_queries > 50 OR (recent_queries > 20 AND distinct_tables > 5) THEN
    -- Log security alert
    INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
    VALUES (
      NEW.user_id, 
      'SECURITY_ALERT', 
      'potential_harvesting',
      format('Queries: %s, Tables: %s in 10min', recent_queries, distinct_tables)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Attach harvesting detection trigger
DROP TRIGGER IF EXISTS detect_harvesting_trigger ON sensitive_data_access_log;
CREATE TRIGGER detect_harvesting_trigger
  AFTER INSERT ON sensitive_data_access_log
  FOR EACH ROW
  EXECUTE FUNCTION detect_data_harvesting();

-- 4. Update the sanitized view to be more restrictive
DROP VIEW IF EXISTS public.ai_usage_logs_sanitized;
CREATE VIEW public.ai_usage_logs_sanitized 
WITH (security_invoker = true) AS
SELECT 
  id,
  -- Anonymize model names to generic categories for non-platform-owners
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = 'antono.george07@gmail.com')
    THEN model
    ELSE CASE 
      WHEN model LIKE '%gemini%' THEN 'gemini'
      WHEN model LIKE '%gpt%' THEN 'gpt'
      ELSE 'other'
    END
  END as model,
  status,
  DATE(created_at) as usage_date -- Only date, not exact time
FROM ai_usage_logs 
WHERE user_id = auth.uid();

COMMENT ON VIEW public.ai_usage_logs_sanitized IS 'Sanitized AI usage view - anonymizes model names and removes timestamps precision';

-- 5. Create function to get anonymized usage trends (no individual patterns)
CREATE OR REPLACE FUNCTION public.get_my_ai_usage_trends()
RETURNS TABLE(
  usage_week DATE,
  request_count BIGINT,
  success_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Return weekly aggregates only (no daily patterns visible)
  RETURN QUERY
  SELECT 
    date_trunc('week', created_at)::DATE as usage_week,
    COUNT(*)::BIGINT as request_count,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as success_count
  FROM ai_usage_logs
  WHERE user_id = auth.uid()
  AND created_at >= now() - INTERVAL '12 weeks'
  GROUP BY date_trunc('week', created_at)
  ORDER BY usage_week DESC
  LIMIT 12;
END;
$$;

-- 6. Drop old RLS policies and ensure no direct access
DROP POLICY IF EXISTS "Users can view own AI usage without costs" ON ai_usage_logs;
DROP POLICY IF EXISTS "Users can view own AI usage for debugging" ON ai_usage_logs;
DROP POLICY IF EXISTS "Users can log AI usage" ON ai_usage_logs;

-- Only allow INSERT through RLS
CREATE POLICY "Users can only insert own AI usage logs"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant execute on new functions
GRANT EXECUTE ON FUNCTION public.get_my_recent_ai_usage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_ai_usage_trends TO authenticated;

-- 7. Add index for efficient rate limit checks
CREATE INDEX IF NOT EXISTS idx_sensitive_access_user_time 
  ON sensitive_data_access_log(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_sensitive_access_type_time
  ON sensitive_data_access_log(access_type, created_at);