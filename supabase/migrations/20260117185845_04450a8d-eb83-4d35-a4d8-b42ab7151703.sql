
-- =====================================================
-- SECURITY FIX 1: Jira Tokens - Create safe view (excludes all sensitive token data)
-- =====================================================

-- Create safe view that excludes all encrypted/raw tokens
CREATE OR REPLACE VIEW public.user_jira_tokens_safe
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    jira_email,
    jira_site_url,
    is_valid,
    last_validated_at,
    validation_error,
    scopes,
    oauth_provider,
    cloud_id,
    token_expires_at,
    created_at,
    updated_at
  FROM public.user_jira_tokens;
  -- EXCLUDES: jira_token, encrypted_token, refresh_token, refresh_token_encrypted, encrypted_access_token, encrypted_refresh_token

-- Grant access to the safe view
GRANT SELECT ON public.user_jira_tokens_safe TO authenticated;

-- =====================================================
-- SECURITY FIX 2: Profiles - Create masked view for teammate visibility
-- =====================================================

-- Create a function to mask email addresses for privacy
CREATE OR REPLACE FUNCTION public.mask_teammate_email(email text, viewer_id uuid, profile_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If viewing own profile, show full email
  IF viewer_id = profile_id THEN
    RETURN email;
  END IF;
  
  -- For teammates, show masked email (first 2 chars + *** + domain)
  IF email IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN LEFT(SPLIT_PART(email, '@', 1), 2) || '***@' || SPLIT_PART(email, '@', 2);
END;
$$;

-- Create safe profiles view with email masking for teammates
CREATE OR REPLACE VIEW public.profiles_teammate_safe
WITH (security_invoker=on) AS
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.created_at,
    p.updated_at,
    p.last_activity_at,
    -- Mask email for non-self views
    CASE 
      WHEN auth.uid() = p.id THEN p.email
      ELSE public.mask_teammate_email(p.email, auth.uid(), p.id)
    END as email
  FROM public.profiles p;
  -- EXCLUDES: preferences, consent data, anonymization flags, deletion_requested_at

-- Grant access to safe view
GRANT SELECT ON public.profiles_teammate_safe TO authenticated;

-- =====================================================
-- SECURITY FIX 3: Access Logs - Add automatic retention cleanup (90 days)
-- =====================================================

-- Create function to clean old access logs (90 day retention)
-- Uses correct column names: accessed_at for profile_access_log/token_access_audit, created_at for sensitive_data_access_log
CREATE OR REPLACE FUNCTION public.cleanup_old_access_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete profile access logs older than 90 days
  DELETE FROM public.profile_access_log
  WHERE accessed_at < NOW() - INTERVAL '90 days';
  
  -- Delete sensitive data access logs older than 90 days (uses created_at column)
  DELETE FROM public.sensitive_data_access_log
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Delete token access audit logs older than 90 days
  DELETE FROM public.token_access_audit
  WHERE accessed_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Add rate limiting function for profile queries to prevent enumeration attacks
CREATE OR REPLACE FUNCTION public.check_profile_query_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Count queries in last minute
  SELECT COUNT(*) INTO recent_count
  FROM public.profile_access_log
  WHERE user_id = auth.uid()
    AND accessed_at > NOW() - INTERVAL '1 minute';
  
  -- Limit to 60 queries per minute
  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded for profile queries';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS profile_query_rate_limit_trigger ON public.profile_access_log;
CREATE TRIGGER profile_query_rate_limit_trigger
  BEFORE INSERT ON public.profile_access_log
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_query_rate_limit();

-- Add indexes for efficient cleanup queries (using correct column names)
CREATE INDEX IF NOT EXISTS idx_profile_access_log_accessed_at 
  ON public.profile_access_log(accessed_at);
CREATE INDEX IF NOT EXISTS idx_sensitive_data_access_log_created_at 
  ON public.sensitive_data_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_token_access_audit_accessed_at 
  ON public.token_access_audit(accessed_at);

-- Document retention policy
COMMENT ON TABLE public.profile_access_log IS 'Profile access audit log - 90 day retention policy enforced by cleanup_old_access_logs()';
COMMENT ON TABLE public.sensitive_data_access_log IS 'Sensitive data access audit - 90 day retention policy enforced by cleanup_old_access_logs()';
COMMENT ON TABLE public.token_access_audit IS 'Token access audit - 90 day retention policy enforced by cleanup_old_access_logs()';
