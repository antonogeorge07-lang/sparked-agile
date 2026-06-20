-- Safe removal of pending approval system (keeping 'pending' in enum but unused)

-- 1. Update all users with pending role to member
UPDATE user_roles SET role = 'member' WHERE role = 'pending';
UPDATE profiles SET role = 'member' WHERE role = 'pending';

-- 2. Drop ONLY the approval-specific policies
DROP POLICY IF EXISTS "Pending users can only view own profile" ON profiles;
DROP POLICY IF EXISTS "Approved users can create projects" ON projects;
DROP POLICY IF EXISTS "Approved users can log activity" ON user_activity_logs;
DROP POLICY IF EXISTS "Approved users can log AI usage" ON ai_usage_logs;

-- 3. Drop ONLY the approval-specific functions (keep is_admin, check_user_role, get_user_role)
DROP FUNCTION IF EXISTS public.is_pending_user(uuid);
DROP FUNCTION IF EXISTS public.is_approved_user(uuid);
DROP FUNCTION IF EXISTS public.approve_user(uuid);

-- 4. Create new RLS policies without approval restrictions

-- Profiles: All authenticated users can view all profiles
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Projects: Workspace members can create projects (no approval check)
CREATE POLICY "Workspace members can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = projects.workspace_id
    AND (w.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
    ))
  )
);

-- AI usage logs: All authenticated users can log (no approval check)
CREATE POLICY "Users can log AI usage"
ON ai_usage_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- User activity logs: All authenticated users can log (no approval check)
CREATE POLICY "Users can log activity"
ON user_activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Update handle_new_user to assign 'member' role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  
  RETURN NEW;
END;
$$;

-- Note: 'pending' value remains in app_role enum but is unused
-- This is safe and prevents breaking existing functions/policies that depend on the enum type