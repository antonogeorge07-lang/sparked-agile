-- Fix infinite recursion in workspace_members RLS policies

DO $$
DECLARE
  pol record;
BEGIN
  -- Drop ALL existing policies on workspace_members to remove any recursive logic
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'workspace_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workspace_members', pol.policyname);
  END LOOP;
END$$;

-- Recreate safe, non-recursive policies for workspace_members

-- 1) Allow each user to see their own workspace memberships
CREATE POLICY "Users can view their own workspace memberships"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- 2) Allow workspace owners to view all members in their workspaces
CREATE POLICY "Workspace owners can view all members"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.workspaces w
    WHERE w.id = workspace_id
      AND w.owner_id = auth.uid()
  )
);

-- 3) Allow workspace owners to manage (insert/update/delete) members in their workspaces
CREATE POLICY "Workspace owners can manage members"
ON public.workspace_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.workspaces w
    WHERE w.id = workspace_id
      AND w.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspaces w
    WHERE w.id = workspace_id
      AND w.owner_id = auth.uid()
  )
);
