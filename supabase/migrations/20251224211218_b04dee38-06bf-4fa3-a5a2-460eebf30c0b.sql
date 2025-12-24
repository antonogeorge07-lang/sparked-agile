-- Comprehensive Security Hardening Migration
-- Addresses: profiles exposure, Microsoft tokens, AI usage logs

-- ============================================
-- 1. PROFILES TABLE - Mask sensitive data, add audit logging
-- ============================================

-- Create secure function to get teammate profile with masked email
CREATE OR REPLACE FUNCTION public.get_teammate_profile_safe(teammate_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify the user is actually a teammate
  IF NOT EXISTS (
    SELECT 1 FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid()
    AND pm2.user_id = teammate_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to view this profile';
  END IF;

  -- Log profile access
  INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
  VALUES (auth.uid(), 'profiles', 'teammate_view', format('Viewed profile: %s', teammate_id));

  -- Return limited profile data (NO EMAIL)
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.full_name, 'Team Member') as display_name,
    p.avatar_url
  FROM profiles p
  WHERE p.id = teammate_id;
END;
$$;

-- Create masked profile view for teammates (hides email)
DROP VIEW IF EXISTS public.project_teammates CASCADE;
CREATE VIEW public.project_teammates
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  COALESCE(p.full_name, 'Team Member') as full_name,
  p.avatar_url
  -- EMAIL EXPLICITLY EXCLUDED
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.project_members pm1
  JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
  WHERE pm1.user_id = auth.uid()
  AND pm2.user_id = p.id
);

COMMENT ON VIEW public.project_teammates IS 'Secure view showing teammate profiles without email addresses';

-- Update RLS on profiles to be more restrictive
DROP POLICY IF EXISTS "Users can view project teammate profiles" ON profiles;

-- Users can only view full profile of themselves
CREATE POLICY "Users can only view own full profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id OR is_admin(auth.uid()));

-- ============================================
-- 2. MICROSOFT TOKENS - Enhanced security
-- ============================================

-- Create audit logging for token access
CREATE OR REPLACE FUNCTION public.log_token_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Log any access to token tables
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
      WHEN TG_OP = 'INSERT' THEN 'Token created'
      WHEN TG_OP = 'UPDATE' THEN 'Token updated'
      WHEN TG_OP = 'DELETE' THEN 'Token deleted'
      ELSE 'Token accessed'
    END,
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for Microsoft token auditing
DROP TRIGGER IF EXISTS audit_microsoft_tokens ON user_microsoft_tokens;
CREATE TRIGGER audit_microsoft_tokens
  AFTER INSERT OR UPDATE OR DELETE ON user_microsoft_tokens
  FOR EACH ROW
  EXECUTE FUNCTION log_token_access();

-- Add trigger for Slack token auditing
DROP TRIGGER IF EXISTS audit_slack_tokens ON user_slack_tokens;
CREATE TRIGGER audit_slack_tokens
  AFTER INSERT OR UPDATE OR DELETE ON user_slack_tokens
  FOR EACH ROW
  EXECUTE FUNCTION log_token_access();

-- Create secure function to check token health without exposing token data
CREATE OR REPLACE FUNCTION public.get_my_integration_status()
RETURNS TABLE(
  integration_type TEXT,
  is_connected BOOLEAN,
  is_valid BOOLEAN,
  expires_soon BOOLEAN,
  last_used TIMESTAMPTZ
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
  -- Microsoft
  SELECT 
    'microsoft'::TEXT,
    TRUE,
    COALESCE(m.is_valid, false),
    m.expires_at < now() + INTERVAL '24 hours',
    m.updated_at
  FROM user_microsoft_tokens m
  WHERE m.user_id = auth.uid()
  
  UNION ALL
  
  -- Slack
  SELECT 
    'slack'::TEXT,
    TRUE,
    COALESCE(s.is_valid, false),
    FALSE, -- Slack tokens don't expire same way
    s.updated_at
  FROM user_slack_tokens s
  WHERE s.user_id = auth.uid();
END;
$$;

-- ============================================
-- 3. AI USAGE LOGS - Fix RLS gap
-- ============================================

-- Ensure explicit SELECT policy exists (was revoked earlier, add back with restriction)
DROP POLICY IF EXISTS "Users can only insert own AI usage logs" ON ai_usage_logs;
DROP POLICY IF EXISTS "Users can view own AI usage logs" ON ai_usage_logs;

-- INSERT policy
CREATE POLICY "Users can only insert own AI usage logs"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Explicit SELECT policy - users can ONLY see their own logs
CREATE POLICY "Users can view only own AI usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE or DELETE allowed (logs are immutable)
-- Verify no other policies allow broader access
DROP POLICY IF EXISTS "Only platform owner can view AI usage" ON ai_usage_logs;

-- ============================================
-- 4. Additional Security Hardening
-- ============================================

-- Revoke any remaining public access
REVOKE ALL ON public.profiles FROM anon, public;
REVOKE ALL ON public.user_microsoft_tokens FROM anon, public;
REVOKE ALL ON public.user_slack_tokens FROM anon, public;

-- Grant only necessary permissions
GRANT SELECT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.user_microsoft_tokens TO authenticated;
GRANT ALL ON public.user_slack_tokens TO authenticated;

-- Grant execute on new functions
GRANT EXECUTE ON FUNCTION public.get_teammate_profile_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_integration_status TO authenticated;

-- Add index for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_sensitive_log_table_time
  ON sensitive_data_access_log(table_accessed, created_at DESC);