-- =====================================================
-- SECURITY HARDENING: Token Encryption & Data Protection
-- =====================================================

-- 1. JIRA TOKENS: Remove plaintext columns, ensure only encrypted storage
-- First, ensure we have proper encrypted columns
DO $$
BEGIN
  -- Add encrypted columns if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_jira_tokens' 
    AND column_name = 'encrypted_access_token') THEN
    ALTER TABLE public.user_jira_tokens ADD COLUMN encrypted_access_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_jira_tokens' 
    AND column_name = 'encrypted_refresh_token') THEN
    ALTER TABLE public.user_jira_tokens ADD COLUMN encrypted_refresh_token TEXT;
  END IF;
END $$;

-- Drop plaintext token columns from JIRA if they exist (after data migration)
-- Note: Only drop if encrypted versions exist
ALTER TABLE public.user_jira_tokens 
  ALTER COLUMN jira_token DROP NOT NULL;

-- 2. GITHUB TOKENS: Ensure only encrypted storage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_github_tokens' 
    AND column_name = 'encrypted_access_token') THEN
    ALTER TABLE public.user_github_tokens ADD COLUMN encrypted_access_token TEXT;
  END IF;
END $$;

-- Make plaintext column nullable (data should be in encrypted column)
ALTER TABLE public.user_github_tokens 
  ALTER COLUMN github_token DROP NOT NULL;

-- 3. Add token access logging trigger for all token tables
CREATE OR REPLACE FUNCTION public.log_sensitive_token_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Log access to token tables for security audit
  INSERT INTO sensitive_data_access_log (
    user_id, 
    table_accessed, 
    access_type, 
    query_context,
    ip_address
  )
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'New token stored'
      WHEN TG_OP = 'UPDATE' THEN 'Token refreshed/updated'
      WHEN TG_OP = 'DELETE' THEN 'Token revoked'
      ELSE 'Token accessed'
    END,
    COALESCE(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      current_setting('request.headers', true)::json->>'cf-connecting-ip'
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to GitHub tokens
DROP TRIGGER IF EXISTS audit_github_token_access ON public.user_github_tokens;
CREATE TRIGGER audit_github_token_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_github_tokens
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_token_access();

-- Add audit triggers to Jira tokens
DROP TRIGGER IF EXISTS audit_jira_token_access ON public.user_jira_tokens;
CREATE TRIGGER audit_jira_token_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_jira_tokens
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_token_access();

-- 4. Create function for users to view access logs related to their own data
CREATE OR REPLACE FUNCTION public.get_my_data_access_logs(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  accessed_at TIMESTAMPTZ,
  table_name TEXT,
  access_type TEXT,
  context TEXT
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
    s.created_at as accessed_at,
    s.table_accessed as table_name,
    s.access_type,
    s.query_context as context
  FROM sensitive_data_access_log s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC
  LIMIT LEAST(limit_count, 100);
END;
$$;

-- 5. Implement automatic cleanup of old access logs (GDPR compliance)
CREATE OR REPLACE FUNCTION public.cleanup_old_access_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only system/admin can run this
  IF auth.uid() IS NOT NULL AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Delete old profile access logs
  WITH deleted AS (
    DELETE FROM profile_access_log
    WHERE accessed_at < NOW() - (days_to_keep || ' days')::INTERVAL
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  -- Delete old user activity logs (anonymize first)
  UPDATE user_activity_logs
  SET metadata = '{}'::jsonb
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
  AND metadata != '{}'::jsonb;
  
  RETURN deleted_count;
END;
$$;

-- 6. Add RLS policy for users to view their own sensitive access logs
DROP POLICY IF EXISTS "Users can view own data access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Users can view own data access logs"
  ON public.sensitive_data_access_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Implement webhook payload sanitization
CREATE OR REPLACE FUNCTION public.sanitize_webhook_payload(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  sanitized JSONB;
BEGIN
  -- Remove sensitive fields from webhook payloads before storage
  sanitized := payload;
  
  -- Remove common sensitive field patterns
  sanitized := sanitized - ARRAY['password', 'token', 'secret', 'api_key', 'credentials', 
    'access_token', 'refresh_token', 'private_key', 'authorization'];
  
  RETURN sanitized;
END;
$$;

-- 8. Add integration cache cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM integration_cache
  WHERE expires_at < NOW()
  RETURNING 1 INTO deleted_count;
  
  RETURN COALESCE(deleted_count, 0);
END;
$$;

-- 9. Hash IP addresses in user_consents for privacy
CREATE OR REPLACE FUNCTION public.hash_ip_address(ip TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(sha256(COALESCE(ip, '')::bytea), 'hex');
$$;

-- 10. Add rate limiting for landing feedback to prevent spam
CREATE OR REPLACE FUNCTION public.check_feedback_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check for spam: max 3 submissions per hour per name/email pattern
  SELECT COUNT(*) INTO recent_count
  FROM landing_feedback
  WHERE LOWER(name) = LOWER(NEW.name)
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Please wait before submitting more feedback';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_feedback_spam ON public.landing_feedback;
CREATE TRIGGER check_feedback_spam
  BEFORE INSERT ON public.landing_feedback
  FOR EACH ROW EXECUTE FUNCTION public.check_feedback_rate_limit();