-- ============================================
-- SECURITY FIX: Evolving Multi-Layer Protection
-- ============================================

-- PART 1: Fix Profiles Table - Remove email exposure to teammates
-- ============================================

-- Drop the problematic policy that exposes emails to teammates
DROP POLICY IF EXISTS "Rate-limited profile access through safe function" ON public.profiles;

-- Drop redundant overlapping policies
DROP POLICY IF EXISTS "Users can only view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a single, secure SELECT policy
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR is_admin(auth.uid())
);

-- Create a secure view for teammate display (NO EMAIL, only display info)
DROP VIEW IF EXISTS public.project_teammates;
CREATE VIEW public.project_teammates
WITH (security_invoker = true)
AS
SELECT DISTINCT
  p.id,
  p.full_name,
  p.avatar_url
FROM profiles p
INNER JOIN project_members pm ON pm.user_id = p.id
WHERE EXISTS (
  SELECT 1 FROM project_members my_pm
  WHERE my_pm.user_id = auth.uid()
  AND my_pm.project_id = pm.project_id
);

-- PART 2: Fix Microsoft Tokens - Prevent encrypted tokens from reaching client
-- ============================================

-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Users can manage own Microsoft tokens" ON public.user_microsoft_tokens;

-- Service role has full access (for edge functions)
CREATE POLICY "Service role can manage tokens"
ON public.user_microsoft_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can only see NON-SENSITIVE metadata (the view will filter columns)
CREATE POLICY "Users can view own token status only"
ON public.user_microsoft_tokens FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a safe view that NEVER exposes encrypted tokens
DROP VIEW IF EXISTS public.user_microsoft_token_status;
CREATE VIEW public.user_microsoft_token_status
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  user_email,
  is_valid,
  last_validated_at,
  validation_error,
  expires_at,
  created_at,
  updated_at
FROM user_microsoft_tokens
WHERE user_id = auth.uid();

-- Users can DELETE their own tokens (for disconnect flow)
CREATE POLICY "Users can delete own tokens"
ON public.user_microsoft_tokens FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- PART 3: AI Usage Logs - Already secure, but add explicit protection
-- ============================================

DROP VIEW IF EXISTS public.ai_usage_logs_sanitized;
CREATE VIEW public.ai_usage_logs_sanitized
WITH (security_invoker = true)
AS
SELECT 
  id,
  model,
  status,
  created_at
FROM ai_usage_logs
WHERE user_id = auth.uid();

-- Grant appropriate permissions
GRANT SELECT ON public.project_teammates TO authenticated;
GRANT SELECT ON public.user_microsoft_token_status TO authenticated;
GRANT SELECT ON public.ai_usage_logs_sanitized TO authenticated;

-- PART 4: Add audit logging for token modifications
-- ============================================

CREATE OR REPLACE FUNCTION public.log_microsoft_token_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO sensitive_data_access_log (
    user_id,
    table_accessed,
    access_type,
    query_context
  ) VALUES (
    COALESCE(auth.uid(), COALESCE(NEW.user_id, OLD.user_id)),
    'user_microsoft_tokens',
    TG_OP,
    'Token ' || TG_OP
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_microsoft_token_modification ON public.user_microsoft_tokens;

CREATE TRIGGER audit_microsoft_token_modification
AFTER INSERT OR UPDATE OR DELETE ON public.user_microsoft_tokens
FOR EACH ROW
EXECUTE FUNCTION public.log_microsoft_token_modification();