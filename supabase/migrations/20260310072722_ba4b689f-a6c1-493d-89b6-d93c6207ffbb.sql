
-- ============================================================
-- FIX 1: Professional tier team_member_limit (15 → 50)
-- ============================================================
UPDATE public.subscription_tiers 
SET team_member_limit = 50, updated_at = now()
WHERE name = 'Professional';

-- ============================================================
-- FIX 2: Auto-assign Free tier subscription on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  free_tier_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member'::app_role
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::app_role);

  -- Auto-assign Free tier subscription
  SELECT id INTO free_tier_id FROM public.subscription_tiers WHERE name = 'Free' LIMIT 1;
  IF free_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, tier_id, status, current_period_start, current_period_end)
    VALUES (NEW.id, free_tier_id, 'active', now(), now() + INTERVAL '100 years')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================================
-- FIX 3: Recreate safe views with security_invoker = true
-- ============================================================

-- profiles_safe: restrict to own profile, teammates, or admins
DROP VIEW IF EXISTS public.profiles_safe;
CREATE VIEW public.profiles_safe WITH (security_invoker = on) AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.role,
  p.created_at,
  p.updated_at,
  p.preferences,
  p.last_activity_at,
  CASE
    WHEN p.id = auth.uid() THEN p.email
    WHEN is_admin(auth.uid()) THEN p.email
    ELSE NULL
  END AS email
FROM profiles p
WHERE 
  p.id = auth.uid()
  OR is_admin(auth.uid())
  OR is_platform_owner(auth.uid())
  OR EXISTS (
    SELECT 1 FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = p.id
  );

-- team_members_safe: restrict to project members only
DROP VIEW IF EXISTS public.team_members_safe;
CREATE VIEW public.team_members_safe WITH (security_invoker = on) AS
SELECT 
  tm.id,
  tm.project_id,
  tm.name,
  tm.role,
  tm.created_at,
  CASE
    WHEN is_admin(auth.uid()) THEN tm.email
    WHEN EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = tm.project_id 
        AND pm.user_id = auth.uid()
        AND pm.role IN ('owner', 'admin')
    ) THEN tm.email
    ELSE NULL
  END AS email
FROM team_members tm
WHERE EXISTS (
  SELECT 1 FROM project_members pm
  WHERE pm.project_id = tm.project_id
    AND pm.user_id = auth.uid()
);

-- user_microsoft_token_status: already filtered but add security_invoker
DROP VIEW IF EXISTS public.user_microsoft_token_status;
CREATE VIEW public.user_microsoft_token_status WITH (security_invoker = on) AS
SELECT 
  id, user_id, user_email, is_valid, last_validated_at, 
  validation_error, expires_at, created_at, updated_at
FROM user_microsoft_tokens
WHERE user_id = auth.uid();

-- user_subscription_info: already filtered but add security_invoker
DROP VIEW IF EXISTS public.user_subscription_info;
CREATE VIEW public.user_subscription_info WITH (security_invoker = on) AS
SELECT 
  us.user_id, us.status,
  st.name AS tier_name, st.project_limit, st.team_member_limit,
  st.features, us.current_period_start, us.current_period_end
FROM user_subscriptions us
LEFT JOIN subscription_tiers st ON st.id = us.tier_id
WHERE us.user_id = auth.uid();

-- webhooks_safe: already filtered but add security_invoker
DROP VIEW IF EXISTS public.webhooks_safe;
CREATE VIEW public.webhooks_safe WITH (security_invoker = on) AS
SELECT 
  id, project_id, user_id, url, events, is_active,
  created_at, updated_at,
  (secret IS NOT NULL AND secret <> '') AS has_secret
FROM webhooks
WHERE auth.uid() = user_id;

-- ============================================================
-- FIX 4: Consolidate projects RLS (drop overlapping, keep clean set)
-- ============================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Project owners can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects in their workspaces" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their workspace projects" ON public.projects;
DROP POLICY IF EXISTS "Users can manage their workspace projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their workspace projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view allocated projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their workspace projects" ON public.projects;
DROP POLICY IF EXISTS "Workspace members can create projects" ON public.projects;
DROP POLICY IF EXISTS "Workspace members can view workspace projects" ON public.projects;
DROP POLICY IF EXISTS "Workspace owners can manage projects" ON public.projects;

-- Clean consolidated policies
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_project_member(id, auth.uid())
    OR can_access_workspace_project(id, auth.uid())
  );

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = projects.workspace_id
        AND (w.owner_id = auth.uid() OR is_workspace_member(w.id, auth.uid()))
    )
  );

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR can_access_workspace_project(id, auth.uid())
    OR is_project_member(id, auth.uid())
  );

CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 5: Consolidate profiles RLS (drop overlapping, keep clean set)
-- ============================================================

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own or admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile metadata" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR is_admin(auth.uid())
    OR is_platform_owner(auth.uid())
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (id = auth.uid());

-- ============================================================
-- FIX 6: Secure epic INSERT policies with project membership check
-- ============================================================

DROP POLICY IF EXISTS "Users can create validation runs for their epics" ON public.epic_validation_runs;
CREATE POLICY "Users can create validation runs for their epics" ON public.epic_validation_runs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = run_by
    AND EXISTS (
      SELECT 1 FROM epics e
      JOIN value_streams vs ON vs.id = e.value_stream_id
      JOIN project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_validation_runs.epic_id AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert recalibration logs" ON public.epic_recalibration_log;
CREATE POLICY "Users can insert recalibration logs" ON public.epic_recalibration_log
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = performed_by
    AND EXISTS (
      SELECT 1 FROM epics e
      JOIN value_streams vs ON vs.id = e.value_stream_id
      JOIN project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_recalibration_log.epic_id AND pm.user_id = auth.uid()
    )
  );
