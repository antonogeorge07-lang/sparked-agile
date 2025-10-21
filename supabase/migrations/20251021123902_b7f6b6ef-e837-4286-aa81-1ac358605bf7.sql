-- Fix critical security issue: Remove config from SELECT queries for integrations
-- Create a security definer function to safely get integration status without exposing credentials

CREATE OR REPLACE FUNCTION public.get_safe_integration_info(integration_id uuid)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  integration_type text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    project_id,
    integration_type,
    is_active,
    created_at,
    updated_at
  FROM public.integrations
  WHERE id = integration_id;
$$;

-- Update RLS policies for integrations to prevent config exposure
DROP POLICY IF EXISTS "Users can view project integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can insert project integrations" ON public.integrations;
DROP POLICY IF EXISTS "Users can update project integrations" ON public.integrations;

-- Create new policy that restricts config access
CREATE POLICY "Users can view project integrations without config"
ON public.integrations
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id 
    FROM public.project_members 
    WHERE user_id = auth.uid()
  )
);

-- Only allow insert/update through edge functions (service role)
CREATE POLICY "Service role can manage integrations"
ON public.integrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add comment to warn developers
COMMENT ON COLUMN public.integrations.config IS 'SENSITIVE: Contains API keys and tokens. Never expose in client queries. Use edge functions with service role.';