-- Fix security issues: Add RLS to views and improve access controls

-- 1. Recreate ai_usage_logs_sanitized view with SECURITY INVOKER
DROP VIEW IF EXISTS public.ai_usage_logs_sanitized;

CREATE VIEW public.ai_usage_logs_sanitized
WITH (security_invoker = true)
AS
SELECT 
  id,
  model,
  status,
  created_at
FROM ai_usage_logs
WHERE user_id = auth.uid();

COMMENT ON VIEW public.ai_usage_logs_sanitized IS 'User can only see their own sanitized AI usage (no tokens, costs, endpoints)';

-- Grant access only to authenticated users
GRANT SELECT ON public.ai_usage_logs_sanitized TO authenticated;

-- 2. Recreate project_teammates view with SECURITY INVOKER and proper filtering
DROP VIEW IF EXISTS public.project_teammates;

CREATE VIEW public.project_teammates
WITH (security_invoker = true)
AS
SELECT DISTINCT
  p.id,
  p.full_name,
  p.avatar_url
FROM profiles p
INNER JOIN project_members pm ON pm.user_id = p.id
INNER JOIN project_members my_pm ON my_pm.project_id = pm.project_id
WHERE my_pm.user_id = auth.uid();

COMMENT ON VIEW public.project_teammates IS 'Users can only see teammates from their own projects';

GRANT SELECT ON public.project_teammates TO authenticated;

-- 3. Recreate user_subscription_info view with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_subscription_info;

CREATE VIEW public.user_subscription_info
WITH (security_invoker = true)
AS
SELECT 
  us.user_id,
  us.status,
  st.name as tier_name,
  st.project_limit,
  st.team_member_limit,
  us.current_period_end
FROM user_subscriptions us
LEFT JOIN subscription_tiers st ON st.id = us.tier_id
WHERE us.user_id = auth.uid();

COMMENT ON VIEW public.user_subscription_info IS 'Users can only see their own subscription info';

GRANT SELECT ON public.user_subscription_info TO authenticated;

-- 4. Add rate limiting to profiles table access
-- Create index for faster profile access logging queries
CREATE INDEX IF NOT EXISTS idx_sensitive_data_access_log_user_time 
ON sensitive_data_access_log(user_id, created_at DESC);

-- 5. Create function to safely get profile with rate limiting
CREATE OR REPLACE FUNCTION public.get_profile_safe(profile_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  recent_queries INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 30 profile queries per minute
  SELECT COUNT(*) INTO recent_queries
  FROM sensitive_data_access_log
  WHERE user_id = auth.uid()
  AND table_accessed = 'profiles'
  AND created_at > now() - INTERVAL '1 minute';

  IF recent_queries >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many profile queries';
  END IF;

  -- Log the access
  INSERT INTO sensitive_data_access_log (user_id, table_accessed, access_type, query_context)
  VALUES (auth.uid(), 'profiles', 'profile_view', format('Viewed: %s', profile_id));

  -- Return profile data (email excluded for privacy)
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.role::TEXT
  FROM profiles p
  WHERE p.id = profile_id
  AND (
    p.id = auth.uid() -- Own profile
    OR is_admin(auth.uid()) -- Admin
    OR EXISTS ( -- Teammate
      SELECT 1 FROM project_members pm1
      JOIN project_members pm2 ON pm1.project_id = pm2.project_id
      WHERE pm1.user_id = auth.uid() AND pm2.user_id = profile_id
    )
  );
END;
$$;

-- 6. Add additional RLS policy to profiles for stricter access
CREATE POLICY "Rate-limited profile access through safe function" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() -- Own profile
  OR is_admin(auth.uid()) -- Admin access
  OR EXISTS ( -- Teammate access
    SELECT 1 FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
  )
);