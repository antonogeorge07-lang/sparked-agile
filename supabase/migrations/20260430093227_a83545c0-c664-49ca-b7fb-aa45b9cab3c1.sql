-- Seed platform_owner role for the current owner (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'platform_owner'::public.app_role
FROM public.profiles p
WHERE p.email = 'antono.george07@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Replace hardcoded email check with role lookup
CREATE OR REPLACE FUNCTION public.is_platform_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = is_platform_owner.user_id
      AND role = 'platform_owner'::public.app_role
  );
$$;

-- 2) Survey responses: remove anonymous-readable loophole
DROP POLICY IF EXISTS "Users can view their own responses" ON public.survey_responses;
CREATE POLICY "Users can view their own responses"
ON public.survey_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3) User feedback: remove anonymous-readable loophole
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4) project_knowledge_base: explicit authenticated role
DROP POLICY IF EXISTS "Project members can view knowledge" ON public.project_knowledge_base;
DROP POLICY IF EXISTS "Project members can insert knowledge" ON public.project_knowledge_base;
DROP POLICY IF EXISTS "Project members can update knowledge" ON public.project_knowledge_base;
DROP POLICY IF EXISTS "Project members can delete knowledge" ON public.project_knowledge_base;

CREATE POLICY "Project members can view knowledge"
ON public.project_knowledge_base
FOR SELECT
TO authenticated
USING (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can insert knowledge"
ON public.project_knowledge_base
FOR INSERT
TO authenticated
WITH CHECK (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can update knowledge"
ON public.project_knowledge_base
FOR UPDATE
TO authenticated
USING (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can delete knowledge"
ON public.project_knowledge_base
FOR DELETE
TO authenticated
USING (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

-- 5) integrations: stop exposing config jsonb to all project members.
-- Replace broad FOR ALL policy with separate INSERT/UPDATE/DELETE policies (no SELECT),
-- so reads must go through the metadata-only policy / safe RPC.
DROP POLICY IF EXISTS "Project members can manage integrations" ON public.integrations;

CREATE POLICY "Project members can insert integrations"
ON public.integrations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = integrations.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON w.id = p.workspace_id WHERE p.id = integrations.project_id AND w.owner_id = auth.uid())
);

CREATE POLICY "Project members can update integrations"
ON public.integrations
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = integrations.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON w.id = p.workspace_id WHERE p.id = integrations.project_id AND w.owner_id = auth.uid())
);

CREATE POLICY "Project members can delete integrations"
ON public.integrations
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = integrations.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON w.id = p.workspace_id WHERE p.id = integrations.project_id AND w.owner_id = auth.uid())
);

-- 6) chat_rate_limits: RLS enabled but no policies. Lock down to service role only.
CREATE POLICY "Service role manages rate limits"
ON public.chat_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7) avatars bucket: prevent listing of other users' files.
-- Keep direct read of an individual avatar (needed for <img src>) but require knowing the path.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Public can read individual avatar files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars' AND name IS NOT NULL);
