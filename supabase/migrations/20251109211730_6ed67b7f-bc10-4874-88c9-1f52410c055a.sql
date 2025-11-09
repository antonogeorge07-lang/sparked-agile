-- Fix Profile Data Exposure: Restrict profile visibility to project members only
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Approved users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create restrictive profile viewing policy
-- Users can only view:
-- 1. Their own profile
-- 2. Profiles of users in their projects
-- 3. Admins can view all profiles
CREATE POLICY "Users can view own and project members' profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id  -- Own profile
  OR 
  is_admin(auth.uid())  -- Admins can view all
  OR
  EXISTS (  -- Users in same projects
    SELECT 1
    FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid()
    AND pm2.user_id = profiles.id
  )
);