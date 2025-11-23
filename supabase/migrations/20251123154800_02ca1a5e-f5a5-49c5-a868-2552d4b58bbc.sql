-- Update RLS policies to allow registered users to create and manage their own workspaces and projects

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

-- Drop existing restrictive policies on projects if any
DROP POLICY IF EXISTS "Users can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their projects" ON public.projects;
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;
DROP POLICY IF EXISTS "Workspace members can view projects" ON public.projects;

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow users to create projects in workspaces they own or are members of
CREATE POLICY "Users can create projects in their workspaces"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_id
    AND (
      w.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- Allow users to view projects they own, are workspace owners of, or are members of
CREATE POLICY "Users can view their accessible projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  -- User created the project
  user_id = auth.uid()
  OR
  -- User owns the workspace
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_id
    AND w.owner_id = auth.uid()
  )
  OR
  -- User is a workspace member
  EXISTS (
    SELECT 1 FROM public.workspaces w
    JOIN public.workspace_members wm ON wm.workspace_id = w.id
    WHERE w.id = workspace_id
    AND wm.user_id = auth.uid()
  )
  OR
  -- User is a project member
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = id
    AND pm.user_id = auth.uid()
  )
);

-- Allow users to update projects in their workspaces
CREATE POLICY "Users can update their workspace projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_id
    AND w.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = id
    AND pm.user_id = auth.uid()
    AND pm.role = 'admin'
  )
);

-- Allow users to delete projects they own or workspace projects
CREATE POLICY "Users can delete their workspace projects"
ON public.projects
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = workspace_id
    AND w.owner_id = auth.uid()
  )
);

-- ============================================================================
-- INTEGRATIONS TABLE
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Project members can manage integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can view integrations" ON public.integrations;
DROP POLICY IF EXISTS "Project members can view integrations" ON public.integrations;

-- Enable RLS on integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Allow project members to manage integrations
CREATE POLICY "Project members can manage integrations"
ON public.integrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = integrations.project_id
    AND pm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE p.id = integrations.project_id
    AND w.owner_id = auth.uid()
  )
);

-- ============================================================================
-- PROJECT_WORKSPACES TABLE
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Project members can manage workspaces" ON public.project_workspaces;
DROP POLICY IF EXISTS "Users can view project workspaces" ON public.project_workspaces;

-- Enable RLS on project_workspaces
ALTER TABLE public.project_workspaces ENABLE ROW LEVEL SECURITY;

-- Allow project members to manage project workspaces
CREATE POLICY "Project members can manage project workspaces"
ON public.project_workspaces
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_workspaces.project_id
    AND pm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE p.id = project_workspaces.project_id
    AND w.owner_id = auth.uid()
  )
);

-- ============================================================================
-- WORKSPACE_MEMBERS TABLE - Make it easier to add members
-- ============================================================================

-- Update existing policy to allow workspace owners to invite members more easily
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;

CREATE POLICY "Workspace owners can manage members"
ON public.workspace_members
FOR ALL
TO authenticated
USING (
  public.is_workspace_owner(workspace_id, auth.uid())
);