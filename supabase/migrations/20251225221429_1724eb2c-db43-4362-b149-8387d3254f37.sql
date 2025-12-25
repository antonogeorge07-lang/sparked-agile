-- Fix SECURITY DEFINER view by converting to SECURITY INVOKER
-- This ensures RLS policies are applied based on the querying user

DROP VIEW IF EXISTS public.unified_project_integrations;

-- Recreate as a regular view (SECURITY INVOKER is default)
CREATE VIEW public.unified_project_integrations AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.workspace_id,
  -- Jira integration
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1) as jira_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' LIMIT 1) as jira_active,
  COALESCE(
    (SELECT i.config->>'board_url' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1),
    pw.jira_board_url
  ) as jira_board_url,
  COALESCE(
    (SELECT i.config->>'board_id' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'jira' AND i.is_active = true LIMIT 1),
    pw.jira_board_id
  ) as jira_board_id,
  -- GitHub integration
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1) as github_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' LIMIT 1) as github_active,
  COALESCE(
    (SELECT i.config->>'repo_url' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1),
    pw.github_repo_url
  ) as github_repo_url,
  COALESCE(
    (SELECT i.config->>'repo_name' FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'github' AND i.is_active = true LIMIT 1),
    pw.github_repo_name
  ) as github_repo_name,
  -- Microsoft integration
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'microsoft' AND i.is_active = true LIMIT 1) as microsoft_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'microsoft' LIMIT 1) as microsoft_active,
  pw.outlook_calendar_id,
  pw.teams_channel_id,
  pw.team_distribution_list,
  -- Slack integration
  (SELECT i.id FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'slack' AND i.is_active = true LIMIT 1) as slack_integration_id,
  (SELECT i.is_active FROM integrations i WHERE i.project_id = p.id AND i.integration_type = 'slack' LIMIT 1) as slack_active,
  -- Workspace metadata
  pw.id as workspace_id_legacy,
  pw.name as workspace_name,
  pw.configuration_status
FROM public.projects p
LEFT JOIN public.project_workspaces pw ON pw.project_id = p.id;