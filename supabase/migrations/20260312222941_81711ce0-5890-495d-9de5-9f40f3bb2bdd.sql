
-- Migrate legacy project_workspaces integration data into integrations table
-- This ensures all integration config lives in one place

-- Create Jira integrations from project_workspaces where they don't exist
INSERT INTO public.integrations (project_id, integration_type, name, is_active, config)
SELECT 
  pw.project_id,
  'jira',
  'Jira',
  true,
  jsonb_build_object(
    'board_url', pw.jira_board_url,
    'board_id', pw.jira_board_id
  )
FROM public.project_workspaces pw
WHERE pw.jira_board_url IS NOT NULL
AND pw.project_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.integrations i 
  WHERE i.project_id = pw.project_id 
  AND i.integration_type = 'jira'
)
ON CONFLICT DO NOTHING;

-- Create GitHub integrations from project_workspaces where they don't exist
INSERT INTO public.integrations (project_id, integration_type, name, is_active, config)
SELECT 
  pw.project_id,
  'github',
  'GitHub',
  true,
  jsonb_build_object(
    'repo_url', pw.github_repo_url,
    'repo_name', pw.github_repo_name
  )
FROM public.project_workspaces pw
WHERE pw.github_repo_url IS NOT NULL
AND pw.project_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.integrations i 
  WHERE i.project_id = pw.project_id 
  AND i.integration_type = 'github'
)
ON CONFLICT DO NOTHING;

-- Create Microsoft integrations from project_workspaces where they don't exist
INSERT INTO public.integrations (project_id, integration_type, name, is_active, config)
SELECT 
  pw.project_id,
  'microsoft',
  'Microsoft',
  true,
  jsonb_build_object(
    'calendar_id', pw.outlook_calendar_id,
    'teams_channel_id', pw.teams_channel_id,
    'distribution_list', pw.team_distribution_list
  )
FROM public.project_workspaces pw
WHERE (pw.outlook_calendar_id IS NOT NULL OR pw.teams_channel_id IS NOT NULL)
AND pw.project_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.integrations i 
  WHERE i.project_id = pw.project_id 
  AND i.integration_type = 'microsoft'
)
ON CONFLICT DO NOTHING;

-- Update existing integrations that have empty config with workspace data
UPDATE public.integrations i
SET config = COALESCE(i.config, '{}'::jsonb) || jsonb_build_object(
  'board_url', pw.jira_board_url,
  'board_id', pw.jira_board_id
)
FROM public.project_workspaces pw
WHERE i.project_id = pw.project_id
AND i.integration_type = 'jira'
AND pw.jira_board_url IS NOT NULL
AND (i.config IS NULL OR i.config = '{}'::jsonb OR NOT (i.config ? 'board_url'));

UPDATE public.integrations i
SET config = COALESCE(i.config, '{}'::jsonb) || jsonb_build_object(
  'repo_url', pw.github_repo_url,
  'repo_name', pw.github_repo_name
)
FROM public.project_workspaces pw
WHERE i.project_id = pw.project_id
AND i.integration_type = 'github'
AND pw.github_repo_url IS NOT NULL
AND (i.config IS NULL OR i.config = '{}'::jsonb OR NOT (i.config ? 'repo_url'));

-- Create a helper function for edge functions to get integration config
CREATE OR REPLACE FUNCTION public.get_integration_config(
  p_project_id uuid,
  p_integration_type text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'integration_id', i.id,
    'is_active', i.is_active,
    'config', COALESCE(i.config, '{}'::jsonb)
  ) INTO result
  FROM public.integrations i
  WHERE i.project_id = p_project_id
  AND i.integration_type = p_integration_type
  AND i.is_active = true
  LIMIT 1;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Create function to resolve project_id from workspace_id (backward compat)
CREATE OR REPLACE FUNCTION public.get_project_id_from_workspace(p_workspace_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT project_id FROM public.project_workspaces WHERE id = p_workspace_id LIMIT 1;
$$;
