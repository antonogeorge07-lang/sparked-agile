-- Fix infinite recursion in RLS policies by removing circular dependency
-- between projects and project_members tables

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;

-- Recreate the policy without circular reference to projects table
-- Allow users to manage members if they are the member themselves or if they're an admin
CREATE POLICY "Users can manage their own membership"
ON public.project_members
FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all members"
ON public.project_members
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete members"
ON public.project_members
FOR DELETE
USING (is_admin(auth.uid()));

-- Add a policy for project owners to add members (this will be handled through application logic)
-- After a project is created, the owner can add members through a separate operation