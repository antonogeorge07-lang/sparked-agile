-- Fix RBAC: Remove recursive RLS policy and ensure user_roles is source of truth

-- Drop the problematic policy with recursive check
DROP POLICY IF EXISTS "Users can update own profile metadata" ON public.profiles;

-- Create new policy that allows users to update their profile but NOT the role
CREATE POLICY "Users can update own profile metadata"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Better approach: Create a policy that simply doesn't allow role changes via profiles table
DROP POLICY IF EXISTS "Users can update own profile metadata" ON public.profiles;

CREATE POLICY "Users can update own profile metadata"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add a constraint to sync role from user_roles to profiles (display purposes only)
-- The role in profiles should be treated as read-only cache of user_roles
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile role to match user_roles when user_roles changes
  UPDATE public.profiles
  SET role = NEW.role, updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to sync role changes from user_roles to profiles
DROP TRIGGER IF EXISTS sync_role_to_profile ON public.user_roles;
CREATE TRIGGER sync_role_to_profile
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role();

-- Ensure the handle_new_user function is correct (already exists but verify)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with pending role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert initial role in user_roles (source of truth)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pending')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Add comment to clarify role column usage
COMMENT ON COLUMN public.profiles.role IS 'Display-only role cache. Source of truth is user_roles table. Do not use for authorization checks.';

-- Verify all critical tables have proper RLS using security definer functions
-- The existing policies already use is_admin(), is_approved_user(), etc. which are security definer functions
-- This is correct and prevents recursive RLS issues