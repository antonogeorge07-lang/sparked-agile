-- Fix workspaces RLS policy to avoid infinite recursion

-- Drop existing policy that directly queries workspace_members
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;

-- Create new policy using security definer function
CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR public.is_workspace_member(id, auth.uid())
);