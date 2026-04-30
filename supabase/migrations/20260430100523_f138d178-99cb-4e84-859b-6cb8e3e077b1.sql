
-- 1. Fix user_roles privilege escalation: replace ALL policy with explicit per-command policies
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- 2. Remove unnecessary/misleading service_role JWT policy on user_google_tokens
DROP POLICY IF EXISTS "Service role can manage tokens" ON public.user_google_tokens;

-- 3. Replace hardcoded email check on data_breach_access_audit with role-based check
DROP POLICY IF EXISTS "Only platform owner can view audit trail" ON public.data_breach_access_audit;

CREATE POLICY "Only platform owner can view audit trail"
ON public.data_breach_access_audit FOR SELECT TO authenticated
USING (is_platform_owner(auth.uid()));

-- 4. Make data_breach_access_audit immutable: restrict INSERT and explicitly block UPDATE/DELETE
DROP POLICY IF EXISTS "Audit records are immutable - insert only" ON public.data_breach_access_audit;

-- Inserts only allowed via SECURITY DEFINER functions (service role bypasses RLS); block all authenticated direct writes
CREATE POLICY "Block direct authenticated inserts"
ON public.data_breach_access_audit FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "Block authenticated updates"
ON public.data_breach_access_audit FOR UPDATE TO authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "Block authenticated deletes"
ON public.data_breach_access_audit FOR DELETE TO authenticated
USING (false);

-- 5. team_members: add explicit SELECT policy via owner/admin (replacing always-false) so writes aren't orphaned
DROP POLICY IF EXISTS "No direct select on team_members" ON public.team_members;

CREATE POLICY "Project owners and admins can view team members"
ON public.team_members FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = team_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ) OR is_admin(auth.uid())
);
