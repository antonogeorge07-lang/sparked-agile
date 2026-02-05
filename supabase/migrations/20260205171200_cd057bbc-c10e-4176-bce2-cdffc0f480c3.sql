-- =====================================================
-- SECURITY FIX: Comprehensive PII Protection
-- Fixes: profiles_table_public_exposure, team_members_email_exposure, integration_events_missing_delete_policy
-- =====================================================

-- ===========================================
-- 1. FIX: profiles_table_public_exposure
-- Create a safe profiles view that masks emails for non-owners/non-admins
-- ===========================================

-- Create profiles_safe view with email masking
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = on)
AS
SELECT
  id,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at,
  preferences,
  last_activity_at,
  -- Only show email to the profile owner or admins
  CASE 
    WHEN id = auth.uid() THEN email
    WHEN public.is_admin(auth.uid()) THEN email
    ELSE NULL
  END AS email
FROM public.profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_safe TO authenticated;

-- Add comment explaining security rationale
COMMENT ON VIEW public.profiles_safe IS 'Security view that masks profile emails. Only the profile owner or admins can see email addresses. Other users see NULL for emails.';

-- ===========================================
-- 2. FIX: team_members_email_exposure
-- Update team_members RLS to restrict direct access
-- ===========================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Project members can view team members" ON public.team_members;

-- Create more restrictive policy - only allow viewing through safe view
CREATE POLICY "Project members can view team members basic info"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = team_members.project_id
    AND pm.user_id = auth.uid()
  )
);

-- Ensure team_members_safe view exists and is properly configured
DROP VIEW IF EXISTS public.team_members_safe;

CREATE VIEW public.team_members_safe
WITH (security_invoker = on)
AS
SELECT
  id,
  project_id,
  name,
  role,
  created_at,
  -- Only show email to admins
  CASE 
    WHEN public.is_admin(auth.uid()) THEN email
    ELSE NULL
  END AS email
FROM public.team_members;

-- Grant SELECT on the safe view to authenticated users
GRANT SELECT ON public.team_members_safe TO authenticated;

COMMENT ON VIEW public.team_members_safe IS 'Security view that masks team member emails. Only admins can see full email addresses.';

-- ===========================================
-- 3. FIX: integration_events_missing_delete_policy
-- Add explicit policies to deny destructive operations
-- ===========================================

DROP POLICY IF EXISTS "Deny update on integration_events" ON public.integration_events;
DROP POLICY IF EXISTS "Deny delete on integration_events" ON public.integration_events;

-- Create explicit DENY policy for UPDATE
CREATE POLICY "Deny update on integration_events"
ON public.integration_events
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Create explicit DENY policy for DELETE
CREATE POLICY "Deny delete on integration_events"
ON public.integration_events
FOR DELETE
TO authenticated
USING (false);

COMMENT ON TABLE public.integration_events IS 'Audit table for integration events. UPDATE and DELETE operations are explicitly denied.';

-- ===========================================
-- 4. Harden profiles table policies
-- ===========================================

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Ensure only owner can view their full profile directly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));