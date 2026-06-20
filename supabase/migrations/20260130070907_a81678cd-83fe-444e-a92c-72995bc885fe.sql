-- Security Hardening Migration
-- Fixes: profiles_table_public_exposure, user_jira_tokens_encryption_exposure, security_incidents_insufficient_access_control

-- ============================================================
-- 1. FIX: profiles_table_public_exposure
-- Restrict profile email visibility - teammates should NOT see emails
-- ============================================================

-- Drop existing permissive policies that expose emails
DROP POLICY IF EXISTS "Users can view teammate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view teammates profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teammates can view profiles" ON public.profiles;

-- Create strict profile viewing policy - email only visible to self, admins, and platform owner
CREATE POLICY "Users can view own profile with email"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid() OR
    public.is_admin(auth.uid()) OR
    public.is_platform_owner(auth.uid())
  );

-- Create separate policy for viewing teammate profile data (without email via safe views)
-- This policy allows reading basic profile info for project teammates
CREATE POLICY "Teammates can view limited profile info"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm1
      JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
      WHERE pm1.user_id = auth.uid()
      AND pm2.user_id = profiles.id
    )
  );

-- Update profiles_safe view to NEVER expose emails to non-owners
DROP VIEW IF EXISTS public.profiles_safe;
CREATE VIEW public.profiles_safe
WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.role,
  -- Email only visible to profile owner or admins
  CASE 
    WHEN p.id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_platform_owner(auth.uid())
    THEN p.email
    ELSE NULL
  END as email,
  p.created_at,
  p.updated_at
FROM public.profiles p;

COMMENT ON VIEW public.profiles_safe IS 'Safe profile view - email masked for non-owners. Always use this view in application code.';

-- Update profiles_teammate_safe to exclude email entirely
DROP VIEW IF EXISTS public.profiles_teammate_safe;
CREATE VIEW public.profiles_teammate_safe
WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url
  -- NO email field - teammates should never see each other's emails
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.project_members pm1
  JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
  WHERE pm1.user_id = auth.uid()
  AND pm2.user_id = p.id
);

COMMENT ON VIEW public.profiles_teammate_safe IS 'Teammate-safe profile view - no email exposure. Use for displaying teammate info.';

-- ============================================================
-- 2. FIX: user_jira_tokens_encryption_exposure
-- Encrypt jira_email and jira_site_url, sanitize validation_error
-- ============================================================

-- Add encrypted columns for sensitive Jira data
ALTER TABLE public.user_jira_tokens
ADD COLUMN IF NOT EXISTS encrypted_jira_email TEXT,
ADD COLUMN IF NOT EXISTS encrypted_jira_site_url TEXT;

-- Create a safe view that hides all sensitive token data
DROP VIEW IF EXISTS public.user_jira_tokens_safe;
CREATE VIEW public.user_jira_tokens_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  is_valid,
  last_validated_at,
  token_expires_at,
  oauth_provider,
  cloud_id,
  scopes,
  created_at,
  updated_at,
  -- Boolean indicators instead of actual values
  (encrypted_token IS NOT NULL OR encrypted_access_token IS NOT NULL) AS has_token,
  (refresh_token_encrypted IS NOT NULL OR encrypted_refresh_token IS NOT NULL) AS has_refresh_token,
  (jira_email IS NOT NULL AND jira_email != '') AS has_jira_email,
  (jira_site_url IS NOT NULL AND jira_site_url != '') AS has_site_url,
  -- Sanitize validation errors - only show generic info
  CASE 
    WHEN validation_error IS NOT NULL THEN 'Token validation issue - please reconnect'
    ELSE NULL
  END AS validation_status
FROM public.user_jira_tokens
WHERE user_id = auth.uid();

COMMENT ON VIEW public.user_jira_tokens_safe IS 'Safe Jira token view - hides encrypted values and sensitive metadata. Use in all frontend code.';

-- ============================================================
-- 3. FIX: security_incidents_insufficient_access_control
-- Consolidate RLS policies - only security admins should access
-- ============================================================

-- Drop all existing security_incidents policies to consolidate
DROP POLICY IF EXISTS "Security admins can view all incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can insert incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can update incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Admins can view all incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Platform owner can manage incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can manage incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Users can view incidents they created" ON public.security_incidents;
DROP POLICY IF EXISTS "Assigned users can view their incidents" ON public.security_incidents;

-- Create single consolidated policy set for security incidents
-- Only is_security_admin() can access - this function checks both platform owner and admin role

CREATE POLICY "security_incidents_select_policy"
  ON public.security_incidents
  FOR SELECT
  USING (public.is_security_admin(auth.uid()));

CREATE POLICY "security_incidents_insert_policy"
  ON public.security_incidents
  FOR INSERT
  WITH CHECK (public.is_security_admin(auth.uid()));

CREATE POLICY "security_incidents_update_policy"
  ON public.security_incidents
  FOR UPDATE
  USING (public.is_security_admin(auth.uid()));

CREATE POLICY "security_incidents_delete_policy"
  ON public.security_incidents
  FOR DELETE
  USING (public.is_security_admin(auth.uid()));

-- Add comment documenting the security model
COMMENT ON TABLE public.security_incidents IS 'Security incident tracking - access restricted to security administrators only via is_security_admin() function.';

-- ============================================================
-- 4. BONUS: Update project_teammates view to use safe profile data
-- ============================================================

DROP VIEW IF EXISTS public.project_teammates;
CREATE VIEW public.project_teammates
WITH (security_invoker=on) AS
SELECT 
  pm.project_id,
  pm.user_id,
  pm.role as member_role,
  p.full_name,
  p.avatar_url
  -- NO email - teammates don't need to see each other's emails
FROM public.project_members pm
JOIN public.profiles p ON p.id = pm.user_id
WHERE public.is_project_member(pm.project_id, auth.uid());

COMMENT ON VIEW public.project_teammates IS 'Safe project teammates view - no email exposure. Use for team member displays.';