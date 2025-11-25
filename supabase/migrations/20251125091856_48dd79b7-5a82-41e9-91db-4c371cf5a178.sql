-- Fix recursive RLS policy on workspace_members to avoid infinite recursion errors

-- Drop existing workspace_members policies that reference is_workspace_member
DROP POLICY IF EXISTS "Users can view workspace members they belong to" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;

-- Policy: allow users to see their own membership rows and workspace owners to see all members
CREATE POLICY "Workspace members basic visibility"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_workspace_owner(workspace_id, auth.uid())
);

-- Policy: workspace owners can insert members
CREATE POLICY "Workspace owners can insert members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_owner(workspace_id, auth.uid())
);

-- Policy: workspace owners can update members
CREATE POLICY "Workspace owners can update members"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  public.is_workspace_owner(workspace_id, auth.uid())
)
WITH CHECK (
  public.is_workspace_owner(workspace_id, auth.uid())
);

-- Policy: workspace owners can remove members
CREATE POLICY "Workspace owners can delete members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  public.is_workspace_owner(workspace_id, auth.uid())
);