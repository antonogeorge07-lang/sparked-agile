-- Fix views to use security invoker (respects underlying table RLS)
-- This ensures views only return data the user is authorized to see

-- 1. Fix user_microsoft_token_status view - already filters by auth.uid()
DROP VIEW IF EXISTS public.user_microsoft_token_status;
CREATE VIEW public.user_microsoft_token_status 
WITH (security_invoker = true) AS
SELECT id,
    user_id,
    user_email,
    is_valid,
    last_validated_at,
    validation_error,
    expires_at,
    created_at,
    updated_at
FROM user_microsoft_tokens
WHERE user_id = auth.uid();

-- 2. Fix project_teammates view - already filters by project membership
DROP VIEW IF EXISTS public.project_teammates;
CREATE VIEW public.project_teammates 
WITH (security_invoker = true) AS
SELECT DISTINCT p.id,
    p.full_name,
    p.avatar_url
FROM profiles p
JOIN project_members pm ON pm.user_id = p.id
WHERE EXISTS (
    SELECT 1
    FROM project_members my_pm
    WHERE my_pm.user_id = auth.uid() AND my_pm.project_id = pm.project_id
);

-- 3. Fix unified_project_integrations view - add project member check
DROP VIEW IF EXISTS public.unified_project_integrations;
CREATE VIEW public.unified_project_integrations 
WITH (security_invoker = true) AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.workspace_id,
    (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1) AS jira_integration_id,
    (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' LIMIT 1) AS jira_active,
    COALESCE((SELECT i.config ->> 'board_url' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1), pw.jira_board_url) AS jira_board_url,
    COALESCE((SELECT i.config ->> 'board_id' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1), pw.jira_board_id) AS jira_board_id,
    (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1) AS github_integration_id,
    (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' LIMIT 1) AS github_active,
    COALESCE((SELECT i.config ->> 'repo_url' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1), pw.github_repo_url) AS github_repo_url,
    COALESCE((SELECT i.config ->> 'repo_name' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1), pw.github_repo_name) AS github_repo_name,
    (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'microsoft' AND i.is_active = true LIMIT 1) AS microsoft_integration_id,
    (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'microsoft' LIMIT 1) AS microsoft_active,
    pw.outlook_calendar_id,
    pw.teams_channel_id,
    pw.team_distribution_list,
    (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'slack' AND i.is_active = true LIMIT 1) AS slack_integration_id,
    (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'slack' LIMIT 1) AS slack_active,
    pw.id AS workspace_id_legacy,
    pw.name AS workspace_name,
    pw.configuration_status
FROM projects p
LEFT JOIN project_workspaces pw ON pw.project_id = p.id
WHERE EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
);

-- 4. Fix user_subscription_info view - filter by auth.uid()
DROP VIEW IF EXISTS public.user_subscription_info;
CREATE VIEW public.user_subscription_info 
WITH (security_invoker = true) AS
SELECT 
    us.user_id,
    us.status,
    st.name as tier_name,
    st.project_limit,
    st.team_member_limit,
    st.features,
    us.current_period_start,
    us.current_period_end
FROM user_subscriptions us
LEFT JOIN subscription_tiers st ON st.id = us.tier_id
WHERE us.user_id = auth.uid();

-- 5. Fix ai_usage_logs_sanitized view - admin only access
DROP VIEW IF EXISTS public.ai_usage_logs_sanitized;
CREATE VIEW public.ai_usage_logs_sanitized 
WITH (security_invoker = true) AS
SELECT 
    id,
    endpoint,
    model,
    status,
    tokens_used,
    cost_estimate,
    created_at
FROM ai_usage_logs
WHERE is_admin(auth.uid()) OR user_id = auth.uid();