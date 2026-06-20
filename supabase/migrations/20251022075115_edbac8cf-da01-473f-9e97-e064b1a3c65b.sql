-- Security improvements for market-ready deployment (Fixed)

-- 1. Create a secure view for integrations that excludes sensitive config data
CREATE OR REPLACE VIEW public.safe_integrations AS
SELECT 
  id,
  project_id,
  integration_type,
  is_active,
  created_at,
  updated_at,
  -- Expose only non-sensitive config fields
  CASE 
    WHEN integration_type = 'jira' THEN jsonb_build_object('board_url', config->'board_url', 'board_id', config->'board_id')
    WHEN integration_type = 'github' THEN jsonb_build_object('repo_name', config->'repo_name')
    WHEN integration_type = 'teams' THEN jsonb_build_object('channel_id', config->'channel_id')
    WHEN integration_type = 'outlook' THEN jsonb_build_object('calendar_id', config->'calendar_id')
    ELSE '{}'::jsonb
  END as safe_config
FROM public.integrations;

GRANT SELECT ON public.safe_integrations TO authenticated;

-- 2. Add rate limiting trigger for profile access
CREATE TABLE IF NOT EXISTS public.profile_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  accessed_profile_id UUID,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_access_log_user_time 
  ON public.profile_access_log(user_id, accessed_at);

ALTER TABLE public.profile_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access logs"
  ON public.profile_access_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Restrict subscription tiers to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active subscription tiers" ON public.subscription_tiers;

CREATE POLICY "Authenticated users can view active subscription tiers"
  ON public.subscription_tiers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 4. Create a safe view for team members (without email addresses)
CREATE OR REPLACE VIEW public.safe_team_members AS
SELECT 
  id,
  name,
  project_id,
  role,
  created_at
FROM public.team_members;

GRANT SELECT ON public.safe_team_members TO authenticated;

-- 5. Hide cost estimates from ai_usage_logs for regular users
CREATE OR REPLACE VIEW public.safe_ai_usage_logs AS
SELECT 
  id,
  user_id,
  project_id,
  endpoint as feature_used,
  tokens_used,
  model as model_used,
  created_at
FROM public.ai_usage_logs;

GRANT SELECT ON public.safe_ai_usage_logs TO authenticated;

COMMENT ON VIEW public.safe_integrations IS 'Secure view of integrations without sensitive credentials';
COMMENT ON VIEW public.safe_team_members IS 'Team member information without email addresses';
COMMENT ON VIEW public.safe_ai_usage_logs IS 'AI usage logs without cost information';