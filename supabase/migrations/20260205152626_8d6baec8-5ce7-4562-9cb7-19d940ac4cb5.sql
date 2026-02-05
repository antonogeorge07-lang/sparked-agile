-- =====================================================
-- SECURITY FIX: Protect PII (email addresses) from exposure
-- Addresses: profiles_email_teammate_exposure, profiles_table_public_exposure, team_members_email_exposure
-- =====================================================

-- 1. DROP the problematic profiles policy that allows teammates to SELECT directly
-- This forces teammates to use safe views instead
DROP POLICY IF EXISTS "Teammates can view limited profile info" ON public.profiles;

-- 2. Ensure team_members_safe view exists with proper email masking
-- This view allows project members to see team member names but NOT emails
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
  -- Only show email to admins, mask for everyone else
  CASE 
    WHEN is_admin(auth.uid()) THEN email
    ELSE NULL
  END AS email
FROM public.team_members;

-- 3. Grant SELECT on the safe view to authenticated users
GRANT SELECT ON public.team_members_safe TO authenticated;

-- 4. Add a comment explaining the security rationale
COMMENT ON VIEW public.team_members_safe IS 'Security view that masks team member emails. Only admins can see full email addresses. Regular project members see NULL for emails.';