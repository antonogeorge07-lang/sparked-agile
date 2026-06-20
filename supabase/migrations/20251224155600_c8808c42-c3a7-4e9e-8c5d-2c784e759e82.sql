-- Fix 1: Ensure project_teammates view has proper security
-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.project_teammates;

-- Recreate project_teammates as a secure view that only returns teammates
-- This view will inherit RLS from the profiles table
CREATE OR REPLACE VIEW public.project_teammates
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 FROM public.project_members pm1
  JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
  WHERE pm1.user_id = auth.uid()
  AND pm2.user_id = p.id
);

-- Add comment for documentation
COMMENT ON VIEW public.project_teammates IS 'Secure view showing only profiles of users who share at least one project with the current user';

-- Fix 2: Add additional RLS policy to profiles to be more explicit about restrictions
-- Revoke direct public access to ensure only through policies
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;

-- Grant select to authenticated users (RLS will control what they can see)
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT DELETE ON public.profiles TO authenticated;

-- Fix 3: Ensure user_microsoft_tokens has proper grants
REVOKE ALL ON public.user_microsoft_tokens FROM anon;
REVOKE ALL ON public.user_microsoft_tokens FROM public;
GRANT ALL ON public.user_microsoft_tokens TO authenticated;

-- Fix 4: Ensure user_slack_tokens has proper grants
REVOKE ALL ON public.user_slack_tokens FROM anon;
REVOKE ALL ON public.user_slack_tokens FROM public;
GRANT ALL ON public.user_slack_tokens TO authenticated;

-- Fix 5: Ensure user_github_tokens has proper grants (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_github_tokens') THEN
    EXECUTE 'REVOKE ALL ON public.user_github_tokens FROM anon';
    EXECUTE 'REVOKE ALL ON public.user_github_tokens FROM public';
    EXECUTE 'GRANT ALL ON public.user_github_tokens TO authenticated';
  END IF;
END $$;

-- Fix 6: Ensure user_jira_tokens has proper grants (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_jira_tokens') THEN
    EXECUTE 'REVOKE ALL ON public.user_jira_tokens FROM anon';
    EXECUTE 'REVOKE ALL ON public.user_jira_tokens FROM public';
    EXECUTE 'GRANT ALL ON public.user_jira_tokens TO authenticated';
  END IF;
END $$;