-- =====================================================
-- WORKSPACE-CENTRIC ARCHITECTURE MIGRATION (Fixed)
-- Transform from centralized admin to self-service workspaces
-- =====================================================

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settings JSONB DEFAULT '{}'::jsonb,
  UNIQUE(owner_id)
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- 2. Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 3. Add workspace_id to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 4. Migrate existing users to workspaces
INSERT INTO public.workspaces (owner_id, name, created_at)
SELECT 
  id,
  COALESCE(full_name, email, 'My Workspace') || '''s Workspace',
  created_at
FROM public.profiles
ON CONFLICT (owner_id) DO NOTHING;

-- 5. Migrate existing projects to workspaces
UPDATE public.projects p
SET workspace_id = w.id
FROM public.workspaces w
WHERE p.user_id = w.owner_id
AND p.workspace_id IS NULL;

UPDATE public.projects p
SET workspace_id = (SELECT id FROM public.workspaces LIMIT 1)
WHERE p.workspace_id IS NULL;

-- 6. Auto-approve all pending users
UPDATE public.user_roles
SET role = 'member'::app_role
WHERE role = 'pending'::app_role;

-- 7. Update subscription tiers
UPDATE public.subscription_tiers
SET 
  project_limit = 5,
  team_member_limit = 5
WHERE name = 'Free';

-- 8. RLS for workspaces
CREATE POLICY "Workspace owners can manage their workspace"
ON public.workspaces FOR ALL TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces FOR SELECT TO authenticated
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspaces.id AND user_id = auth.uid()
  )
);

-- 9. RLS for workspace_members
CREATE POLICY "Workspace members can view other members"
ON public.workspace_members FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_members.workspace_id
    AND (w.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.workspace_members wm2
      WHERE wm2.workspace_id = w.id AND wm2.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Workspace owners can manage members"
ON public.workspace_members FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()
  )
);

-- 10. Update projects RLS
DROP POLICY IF EXISTS "Approved users can join projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their project memberships" ON public.project_members;

CREATE POLICY "Workspace members can view workspace projects"
ON public.projects FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = projects.workspace_id
    AND (w.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Workspace owners can manage projects"
ON public.projects FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = projects.workspace_id AND w.owner_id = auth.uid()
  )
);

-- 11. Update project_members RLS
CREATE POLICY "Workspace members can join workspace projects"
ON public.project_members FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE p.id = project_members.project_id
    AND (w.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can view workspace project memberships"
ON public.project_members FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE p.id = project_members.project_id
    AND (w.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
    ))
  )
);

-- 12. Auto-create workspace function
CREATE OR REPLACE FUNCTION public.create_workspace_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, COALESCE(NEW.full_name, NEW.email, 'My Workspace') || '''s Workspace');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_create_workspace ON public.profiles;
CREATE TRIGGER on_profile_created_create_workspace
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_workspace_on_signup();

-- 13. Update signup to auto-approve
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, preferences)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url', '{}'::jsonb);
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$function$;

-- 14. Admin stats function (privacy-respecting)
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE(
  total_users BIGINT,
  total_workspaces BIGINT,
  total_projects BIGINT,
  active_users_30d BIGINT,
  new_users_7d BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can view platform statistics';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles)::BIGINT,
    (SELECT COUNT(*) FROM public.workspaces)::BIGINT,
    (SELECT COUNT(*) FROM public.projects)::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM public.user_activity_logs 
     WHERE created_at >= NOW() - INTERVAL '30 days')::BIGINT,
    (SELECT COUNT(*) FROM public.profiles 
     WHERE created_at >= NOW() - INTERVAL '7 days')::BIGINT;
END;
$$;

-- 15. Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);

-- 16. Updated_at trigger
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();