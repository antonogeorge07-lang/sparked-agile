-- Add helper function to check if user is pending
CREATE OR REPLACE FUNCTION public.is_pending_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT check_user_role(user_id, 'pending'::app_role);
$$;

-- Add helper function to check if user is approved (member or admin)
CREATE OR REPLACE FUNCTION public.is_approved_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_approved_user.user_id
      AND user_roles.role IN ('admin'::app_role, 'member'::app_role)
  );
$$;

-- Update profiles RLS policies for better access control
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Profiles: View policies
CREATE POLICY "Pending users can only view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id AND is_pending_user(auth.uid())
);

CREATE POLICY "Approved users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_approved_user(auth.uid()));

-- Profiles: Update policies
CREATE POLICY "Users can update own profile metadata"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Projects: Ensure pending users cannot create projects
DROP POLICY IF EXISTS "Approved users can create projects" ON public.projects;

CREATE POLICY "Approved users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  is_approved_user(auth.uid()) AND auth.uid() = user_id
);

-- Project members: Restrict pending users
DROP POLICY IF EXISTS "Users can manage their own membership" ON public.project_members;

CREATE POLICY "Approved users can join projects"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK (
  (is_approved_user(auth.uid()) AND user_id = auth.uid()) 
  OR is_admin(auth.uid())
);

-- User activity logs: Ensure only approved users can log activity
DROP POLICY IF EXISTS "System can insert activity" ON public.user_activity_logs;

CREATE POLICY "Approved users can log activity"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND is_approved_user(auth.uid())
);

-- AI usage logs: Ensure only approved users can log AI usage
DROP POLICY IF EXISTS "System can insert AI usage" ON public.ai_usage_logs;

CREATE POLICY "Approved users can log AI usage"
ON public.ai_usage_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND is_approved_user(auth.uid())
);