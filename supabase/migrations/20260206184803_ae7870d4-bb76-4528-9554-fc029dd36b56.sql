
-- =============================================================
-- FIX 1: Profiles table - Remove public role SELECT policy
-- The policy "Users can view own profile with email" uses public role
-- which allows unauthenticated access. Replace with authenticated-only.
-- =============================================================

DROP POLICY IF EXISTS "Users can view own profile with email" ON public.profiles;

-- Recreate with authenticated role only
CREATE POLICY "Authenticated users can view own or admin profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (id = auth.uid()) 
  OR is_admin(auth.uid()) 
  OR is_platform_owner(auth.uid())
);

-- =============================================================
-- FIX 2: Team members - Restrict email access to owners/admins
-- Replace the ALL policy (public role, exposes emails) with 
-- granular policies. SELECT goes through safe view, mutations 
-- restricted to project owners/admins.
-- =============================================================

-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Project members can manage team members" ON public.team_members;

-- Drop the SELECT policy too (safe view handles reads)
DROP POLICY IF EXISTS "Project members can view team members basic info" ON public.team_members;

-- SELECT: Deny direct SELECT on base table — force usage of team_members_safe view
CREATE POLICY "No direct select on team_members"
ON public.team_members
FOR SELECT
TO authenticated
USING (false);

-- INSERT: Only project owners/admins can add team members
CREATE POLICY "Project owners and admins can insert team members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = team_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('owner', 'admin')
  )
  OR is_admin(auth.uid())
);

-- UPDATE: Only project owners/admins can update team members
CREATE POLICY "Project owners and admins can update team members"
ON public.team_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = team_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('owner', 'admin')
  )
  OR is_admin(auth.uid())
);

-- DELETE: Only project owners/admins can delete team members
CREATE POLICY "Project owners and admins can delete team members"
ON public.team_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = team_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('owner', 'admin')
  )
  OR is_admin(auth.uid())
);

-- Update the safe view to also restrict email to project owners/admins (not just global admins)
DROP VIEW IF EXISTS public.team_members_safe;

CREATE VIEW public.team_members_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  project_id,
  name,
  role,
  created_at,
  CASE
    WHEN is_admin(auth.uid()) THEN email
    WHEN EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = team_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    ) THEN email
    ELSE NULL
  END AS email
FROM public.team_members;

COMMENT ON VIEW public.team_members_safe IS 'Security view that masks team member emails. Only project owners, project admins, and platform admins can see full email addresses.';

-- =============================================================
-- FIX 3: Project budget - Change policies from public to authenticated
-- =============================================================

DROP POLICY IF EXISTS "Users can manage budget in their projects" ON public.project_budget;
DROP POLICY IF EXISTS "Users can view budget in their projects" ON public.project_budget;

-- SELECT: Only project owners can view budget
CREATE POLICY "Authenticated users can view budget in their projects"
ON public.project_budget
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_budget.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- INSERT: Only project owners can create budget entries
CREATE POLICY "Authenticated users can insert budget in their projects"
ON public.project_budget
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_budget.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- UPDATE: Only project owners can update budget
CREATE POLICY "Authenticated users can update budget in their projects"
ON public.project_budget
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_budget.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- DELETE: Only project owners can delete budget
CREATE POLICY "Authenticated users can delete budget in their projects"
ON public.project_budget
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_budget.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);
