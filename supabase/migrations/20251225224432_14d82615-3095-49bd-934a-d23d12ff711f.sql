-- Fix unified_project_integrations view to use SECURITY INVOKER
-- Drop and recreate with security_invoker option

DROP VIEW IF EXISTS public.unified_project_integrations;

CREATE VIEW public.unified_project_integrations
WITH (security_invoker = true)
AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.workspace_id,
  -- JIRA
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1) AS jira_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' LIMIT 1) AS jira_active,
  COALESCE(
    (SELECT i.config->>'board_url' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1),
    pw.jira_board_url
  ) AS jira_board_url,
  COALESCE(
    (SELECT i.config->>'board_id' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1),
    pw.jira_board_id
  ) AS jira_board_id,
  -- GitHub
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1) AS github_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' LIMIT 1) AS github_active,
  COALESCE(
    (SELECT i.config->>'repo_url' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1),
    pw.github_repo_url
  ) AS github_repo_url,
  COALESCE(
    (SELECT i.config->>'repo_name' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1),
    pw.github_repo_name
  ) AS github_repo_name,
  -- Microsoft
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'microsoft' AND i.is_active = true LIMIT 1) AS microsoft_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'microsoft' LIMIT 1) AS microsoft_active,
  pw.outlook_calendar_id,
  pw.teams_channel_id,
  pw.team_distribution_list,
  -- Slack
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'slack' AND i.is_active = true LIMIT 1) AS slack_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'slack' LIMIT 1) AS slack_active,
  -- Legacy workspace info
  pw.id AS workspace_id_legacy,
  pw.name AS workspace_name,
  pw.configuration_status
FROM projects p
LEFT JOIN project_workspaces pw ON pw.project_id = p.id;

-- Grant access to authenticated users
GRANT SELECT ON public.unified_project_integrations TO authenticated;