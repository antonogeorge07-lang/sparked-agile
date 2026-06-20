-- Drop and recreate the view with security_invoker=on to enforce RLS
DROP VIEW IF EXISTS public.unified_project_integrations;

-- Recreate the view WITH security_invoker to respect RLS policies of underlying tables
CREATE VIEW public.unified_project_integrations
WITH (security_invoker=on) AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.workspace_id,
  ( SELECT i.id
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'jira'::text) AND (i.is_active = true))
       LIMIT 1) AS jira_integration_id,
  ( SELECT i.is_active
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'jira'::text))
       LIMIT 1) AS jira_active,
  COALESCE(( SELECT (i.config ->> 'board_url'::text)
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'jira'::text) AND (i.is_active = true))
       LIMIT 1), pw.jira_board_url) AS jira_board_url,
  COALESCE(( SELECT (i.config ->> 'board_id'::text)
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'jira'::text) AND (i.is_active = true))
       LIMIT 1), pw.jira_board_id) AS jira_board_id,
  ( SELECT i.id
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'github'::text) AND (i.is_active = true))
       LIMIT 1) AS github_integration_id,
  ( SELECT i.is_active
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'github'::text))
       LIMIT 1) AS github_active,
  COALESCE(( SELECT (i.config ->> 'repo_url'::text)
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'github'::text) AND (i.is_active = true))
       LIMIT 1), pw.github_repo_url) AS github_repo_url,
  COALESCE(( SELECT (i.config ->> 'repo_name'::text)
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'github'::text) AND (i.is_active = true))
       LIMIT 1), pw.github_repo_name) AS github_repo_name,
  ( SELECT i.id
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'microsoft'::text) AND (i.is_active = true))
       LIMIT 1) AS microsoft_integration_id,
  ( SELECT i.is_active
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'microsoft'::text))
       LIMIT 1) AS microsoft_active,
  pw.outlook_calendar_id,
  pw.teams_channel_id,
  pw.team_distribution_list,
  ( SELECT i.id
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'slack'::text) AND (i.is_active = true))
       LIMIT 1) AS slack_integration_id,
  ( SELECT i.is_active
         FROM integrations i
        WHERE ((i.project_id = p.id) AND (i.integration_type = 'slack'::text))
       LIMIT 1) AS slack_active,
  pw.id AS workspace_id_legacy,
  pw.name AS workspace_name,
  pw.configuration_status
FROM projects p
LEFT JOIN project_workspaces pw ON pw.project_id = p.id
WHERE is_project_member(p.id, auth.uid());

-- Add comment explaining the security model
COMMENT ON VIEW public.unified_project_integrations IS 
'Aggregated integration data for projects. Uses security_invoker=on to enforce RLS policies of underlying tables. Access restricted to authenticated project members only via is_project_member check.';