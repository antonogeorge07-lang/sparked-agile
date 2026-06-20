-- 1. Fix profiles table exposure - restrict to own profile + project teammates
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view project teammate profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm1
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid()
    AND pm2.user_id = profiles.id
  )
);

-- 2. Fix user_subscriptions - create secure view without Stripe IDs for client use
CREATE OR REPLACE VIEW public.user_subscription_info AS
SELECT 
  id,
  user_id,
  tier_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM public.user_subscriptions;

-- Grant access to the view
GRANT SELECT ON public.user_subscription_info TO authenticated;

-- 3. Fix ceremony_configs - ensure outlook_event_id is not exposed unnecessarily
-- The existing RLS is okay, but we'll create a secure function to check outlook IDs
CREATE OR REPLACE FUNCTION public.get_ceremony_outlook_status(ceremony_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT outlook_event_id IS NOT NULL
  FROM public.ceremony_configs
  WHERE id = ceremony_id
  AND EXISTS (
    SELECT 1 FROM project_workspaces pw
    JOIN project_members pm ON pm.project_id = pw.project_id
    WHERE pw.id = ceremony_configs.workspace_id
    AND pm.user_id = auth.uid()
  );
$$;