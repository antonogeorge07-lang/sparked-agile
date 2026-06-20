-- Fix views missing auth.uid() restrictions

-- 1. Fix user_microsoft_tokens_safe - add auth.uid() restriction
DROP VIEW IF EXISTS public.user_microsoft_tokens_safe;
CREATE VIEW public.user_microsoft_tokens_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  is_valid,
  expires_at,
  scopes,
  created_at,
  updated_at,
  (encrypted_access_token IS NOT NULL) AS has_access_token,
  (encrypted_refresh_token IS NOT NULL) AS has_refresh_token
FROM public.user_microsoft_tokens
WHERE user_id = auth.uid();

COMMENT ON VIEW public.user_microsoft_tokens_safe IS 
'Safe view for Microsoft token metadata. Only shows current user data.';

-- 2. Fix user_slack_tokens_safe - add auth.uid() restriction
DROP VIEW IF EXISTS public.user_slack_tokens_safe;
CREATE VIEW public.user_slack_tokens_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  team_id,
  team_name,
  channel_id,
  channel_name,
  scopes,
  is_valid,
  last_validated_at,
  validation_error,
  created_at,
  updated_at,
  (webhook_url IS NOT NULL AND webhook_url != '') AS has_webhook,
  (encrypted_access_token IS NOT NULL) AS has_access_token,
  (encrypted_bot_token IS NOT NULL) AS has_bot_token
FROM public.user_slack_tokens
WHERE user_id = auth.uid();

COMMENT ON VIEW public.user_slack_tokens_safe IS 
'Safe view for Slack token metadata. Only shows current user data.';

-- 3. Fix profiles_safe - add restrictive WHERE clause
DROP VIEW IF EXISTS public.profiles_safe;
CREATE VIEW public.profiles_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  CASE
    WHEN id = auth.uid() OR is_admin(auth.uid()) THEN email
    ELSE NULL
  END AS email,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
FROM public.profiles
WHERE 
  id = auth.uid()
  OR is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
  );

COMMENT ON VIEW public.profiles_safe IS 
'Safe profile view. Email only visible to self or admin. Restricted to own profile, admin, or project teammates.';

-- 4. Fix profiles_teammate_safe - add restrictive WHERE clause  
DROP VIEW IF EXISTS public.profiles_teammate_safe;
CREATE VIEW public.profiles_teammate_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at,
  CASE
    WHEN auth.uid() = id THEN email
    ELSE NULL
  END AS email
FROM public.profiles p
WHERE 
  p.id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = p.id
  );

COMMENT ON VIEW public.profiles_teammate_safe IS 
'Teammate profile view. Email only visible to self. Restricted to project teammates.';

-- 5. Ensure ai_usage_logs_sanitized has proper security
DROP VIEW IF EXISTS public.ai_usage_logs_sanitized;
CREATE VIEW public.ai_usage_logs_sanitized
WITH (security_invoker=on) AS
SELECT 
  id,
  endpoint,
  model,
  status,
  tokens_used,
  cost_estimate,
  created_at
FROM public.ai_usage_logs
WHERE user_id = auth.uid() OR is_admin(auth.uid());

COMMENT ON VIEW public.ai_usage_logs_sanitized IS 
'Sanitized AI usage view. Users see own data, admins see all.';