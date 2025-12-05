-- Drop the overly permissive teammate policy
DROP POLICY IF EXISTS "Users can view project teammate profiles" ON public.profiles;

-- Create a secure function to get teammate info WITHOUT email
CREATE OR REPLACE FUNCTION public.get_project_teammate_profile(teammate_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = teammate_id
  AND EXISTS (
    SELECT 1 FROM public.project_members pm1
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid()
    AND pm2.user_id = teammate_id
  );
$$;

-- Create a secure view for listing teammates (no email exposed)
CREATE OR REPLACE VIEW public.project_teammates
WITH (security_invoker = true) AS
SELECT DISTINCT
  p.id,
  p.full_name,
  p.avatar_url
FROM public.profiles p
JOIN public.project_members pm ON pm.user_id = p.id
WHERE pm.project_id IN (
  SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
);

GRANT SELECT ON public.project_teammates TO authenticated;