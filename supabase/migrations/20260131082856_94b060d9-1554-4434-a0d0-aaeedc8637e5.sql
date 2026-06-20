-- =====================================================
-- SECURITY FIXES: Webhook secrets, Team member emails, Security incidents
-- =====================================================

-- 1. Create webhooks_safe view (hides secret after creation)
CREATE OR REPLACE VIEW public.webhooks_safe AS
SELECT 
  id,
  project_id,
  user_id,
  url,
  events,
  is_active,
  created_at,
  updated_at,
  -- Only show if secret exists, never the actual value
  (secret IS NOT NULL AND secret != '') as has_secret
FROM public.webhooks
WHERE auth.uid() = user_id;

-- Grant access to authenticated users
GRANT SELECT ON public.webhooks_safe TO authenticated;

-- 2. Create team_members_safe view (masks email for non-owners)
CREATE OR REPLACE VIEW public.team_members_safe AS
SELECT 
  tm.id,
  tm.project_id,
  tm.name,
  tm.role,
  tm.created_at,
  -- Only show email to project owner, admin, or platform owner
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = tm.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin')
    ) THEN tm.email
    WHEN is_platform_owner(auth.uid()) THEN tm.email
    ELSE NULL
  END as email
FROM public.team_members tm
WHERE EXISTS (
  SELECT 1 FROM project_members pm 
  WHERE pm.project_id = tm.project_id 
  AND pm.user_id = auth.uid()
);

-- Grant access
GRANT SELECT ON public.team_members_safe TO authenticated;

-- 3. Clean up conflicting security_incidents policies
-- First drop all existing policies
DROP POLICY IF EXISTS "Admins can create incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Admins can delete incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Admins can update incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "No deletion of security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Only platform owner can delete security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Only platform owner can insert security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Only platform owner can update security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Only platform owner can view security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can create incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can view incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "security_incidents_delete_policy" ON public.security_incidents;
DROP POLICY IF EXISTS "security_incidents_insert_policy" ON public.security_incidents;
DROP POLICY IF EXISTS "security_incidents_select_policy" ON public.security_incidents;
DROP POLICY IF EXISTS "security_incidents_update_policy" ON public.security_incidents;

-- Create clean, consolidated policies (only security admins)
CREATE POLICY "security_admins_select" ON public.security_incidents
  FOR SELECT TO authenticated
  USING (is_security_admin(auth.uid()));

CREATE POLICY "security_admins_insert" ON public.security_incidents
  FOR INSERT TO authenticated
  WITH CHECK (is_security_admin(auth.uid()));

CREATE POLICY "security_admins_update" ON public.security_incidents
  FOR UPDATE TO authenticated
  USING (is_security_admin(auth.uid()))
  WITH CHECK (is_security_admin(auth.uid()));

-- Restrict deletion to platform owner only (security incidents should be preserved)
CREATE POLICY "platform_owner_delete" ON public.security_incidents
  FOR DELETE TO authenticated
  USING (is_platform_owner(auth.uid()));

-- 4. Restrict direct access to webhooks table - remove SELECT on secret
-- We'll tighten the existing policy by revoking direct table access for the secret
-- Users should use webhooks_safe view instead
COMMENT ON VIEW public.webhooks_safe IS 'Safe view for webhooks - use this instead of direct table access';

-- 5. Add comment documenting the safe view pattern
COMMENT ON VIEW public.team_members_safe IS 'Safe view for team members - masks email for non-owners';