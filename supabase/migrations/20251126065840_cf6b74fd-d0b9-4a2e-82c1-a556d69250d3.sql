-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view workspace project memberships" ON public.project_members;
DROP POLICY IF EXISTS "Workspace members can join workspace projects" ON public.project_members;

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = _project_id
      AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_workspace_project(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE p.id = _project_id
      AND (
        w.owner_id = _user_id
        OR EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = w.id
            AND wm.user_id = _user_id
        )
      )
  );
$$;

-- Recreate project_members policies using security definer functions
CREATE POLICY "Users can view workspace project memberships"
ON public.project_members
FOR SELECT
USING (can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Workspace members can join workspace projects"
ON public.project_members
FOR INSERT
WITH CHECK (can_access_workspace_project(project_id, auth.uid()));

-- Fix projects table RLS (check if policy exists and recreate)
DROP POLICY IF EXISTS "Users can view their workspace projects" ON public.projects;
DROP POLICY IF EXISTS "Users can manage their workspace projects" ON public.projects;

CREATE POLICY "Users can view their workspace projects"
ON public.projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.workspaces w
    WHERE w.id = projects.workspace_id
      AND (
        w.owner_id = auth.uid()
        OR is_workspace_member(w.id, auth.uid())
      )
  )
);

CREATE POLICY "Users can manage their workspace projects"
ON public.projects
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.workspaces w
    WHERE w.id = projects.workspace_id
      AND w.owner_id = auth.uid()
  )
);