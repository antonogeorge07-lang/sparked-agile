-- Fix SECURITY DEFINER views by explicitly setting SECURITY INVOKER

-- Recreate webhooks_safe with SECURITY INVOKER
DROP VIEW IF EXISTS public.webhooks_safe;
CREATE VIEW public.webhooks_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  project_id,
  user_id,
  url,
  events,
  is_active,
  created_at,
  updated_at,
  (secret IS NOT NULL AND secret != '') as has_secret
FROM public.webhooks
WHERE auth.uid() = user_id;

GRANT SELECT ON public.webhooks_safe TO authenticated;
COMMENT ON VIEW public.webhooks_safe IS 'Safe view for webhooks - use this instead of direct table access';

-- Recreate team_members_safe with SECURITY INVOKER
DROP VIEW IF EXISTS public.team_members_safe;
CREATE VIEW public.team_members_safe 
WITH (security_invoker = true)
AS
SELECT 
  tm.id,
  tm.project_id,
  tm.name,
  tm.role,
  tm.created_at,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = tm.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin')
    ) THEN tm.email
    WHEN is_platform_owner(auth.uid()) THEN tm.email
    ELSE NULL
  END as email
FROM public.team_members tm
WHERE EXISTS (
  SELECT 1 FROM project_members pm 
  WHERE pm.project_id = tm.project_id 
  AND pm.user_id = auth.uid()
);

GRANT SELECT ON public.team_members_safe TO authenticated;
COMMENT ON VIEW public.team_members_safe IS 'Safe view for team members - masks email for non-owners';