-- Create security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
  );
$$;

-- Create security definer function to check workspace ownership
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND owner_id = _user_id
  );
$$;

-- Drop existing policies on workspace_members if they exist
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;

-- Create new policies using security definer functions
CREATE POLICY "Users can view workspace members they belong to"
ON public.workspace_members
FOR SELECT
USING (
  public.is_workspace_owner(workspace_id, auth.uid()) OR
  public.is_workspace_member(workspace_id, auth.uid())
);

CREATE POLICY "Workspace owners can manage members"
ON public.workspace_members
FOR ALL
USING (public.is_workspace_owner(workspace_id, auth.uid()));