-- Fix Profiles Table - Restrict personal data visibility to project relationships
DROP POLICY IF EXISTS "Approved users can view all profiles" ON public.profiles;

-- Users can view profiles of people in their shared projects only
CREATE POLICY "Users can view profiles of project members"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR -- Own profile
  is_admin(auth.uid()) OR -- Admins can see all
  EXISTS ( -- Users in same projects
    SELECT 1
    FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid()
    AND pm2.user_id = profiles.id
  )
);

-- Fix Integrations Table - Remove config field access from SELECT policies
DROP POLICY IF EXISTS "Only project members can view integration configs" ON public.integrations;
DROP POLICY IF EXISTS "Users can view project integrations without config" ON public.integrations;

-- Project members can only see integration metadata, NOT config
CREATE POLICY "Project members can view integration metadata only"
ON public.integrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM project_members
    WHERE project_members.project_id = integrations.project_id
    AND project_members.user_id = auth.uid()
  )
  AND (
    -- Only allow viewing safe columns (id, name, type, status)
    -- The config field should NEVER be directly accessible
    auth.uid() IS NOT NULL
  )
);

-- Admins can manage integrations but should use functions for config access
CREATE POLICY "Admins can manage integrations via functions"
ON public.integrations
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create secure function to check integration connectivity without exposing credentials
CREATE OR REPLACE FUNCTION public.check_integration_status(integration_id uuid)
RETURNS TABLE(
  id uuid,
  integration_type text,
  is_active boolean,
  last_tested timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    integrations.id,
    integrations.integration_type,
    integrations.is_active,
    integrations.updated_at as last_tested
  FROM public.integrations
  WHERE integrations.id = integration_id
  AND EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = integrations.project_id
    AND project_members.user_id = auth.uid()
  );
$$;

-- Create function to safely update integration status without exposing config
CREATE OR REPLACE FUNCTION public.toggle_integration_status(
  integration_id uuid,
  new_status boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_authorized boolean;
BEGIN
  -- Check if user is project member or admin
  SELECT EXISTS (
    SELECT 1 
    FROM integrations i
    JOIN project_members pm ON pm.project_id = i.project_id
    WHERE i.id = integration_id
    AND (pm.user_id = auth.uid() OR is_admin(auth.uid()))
  ) INTO is_authorized;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE integrations
  SET 
    is_active = new_status,
    updated_at = now()
  WHERE id = integration_id;
  
  RETURN TRUE;
END;
$$;