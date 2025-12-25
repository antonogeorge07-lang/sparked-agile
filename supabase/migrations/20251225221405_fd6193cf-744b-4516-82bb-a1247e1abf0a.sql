-- ===========================================
-- INTEGRATION SYSTEM CONSOLIDATION
-- Migrates project_workspaces config into integrations.config
-- ===========================================

-- Step 1: Add committed_points and delivered_points to sprint_planning_sessions for tracking
ALTER TABLE public.sprint_planning_sessions
ADD COLUMN IF NOT EXISTS committed_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivered_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sprint_start_date DATE,
ADD COLUMN IF NOT EXISTS sprint_end_date DATE;

-- Step 2: Create a view that consolidates integration data for easy access
CREATE OR REPLACE VIEW public.unified_project_integrations AS
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

-- Step 3: Create sprint velocity tracking table for historical data
CREATE TABLE IF NOT EXISTS public.sprint_velocity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_number INTEGER NOT NULL,
  committed_points INTEGER DEFAULT 0,
  delivered_points INTEGER DEFAULT 0,
  velocity NUMERIC(10,2) DEFAULT 0,
  team_size INTEGER DEFAULT 1,
  sprint_start_date DATE,
  sprint_end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, sprint_number)
);

-- Enable RLS
ALTER TABLE public.sprint_velocity_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for sprint_velocity_history
CREATE POLICY "Users can view velocity for their projects"
ON public.sprint_velocity_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = sprint_velocity_history.project_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert velocity for their projects"
ON public.sprint_velocity_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = sprint_velocity_history.project_id 
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update velocity for their projects"
ON public.sprint_velocity_history
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = sprint_velocity_history.project_id 
    AND pm.user_id = auth.uid()
  )
);

-- Step 4: Create function to sync velocity from sprint sessions
CREATE OR REPLACE FUNCTION public.sync_sprint_velocity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert or update velocity history when sprint session is updated
  INSERT INTO sprint_velocity_history (
    project_id,
    sprint_number,
    committed_points,
    delivered_points,
    velocity,
    sprint_start_date,
    sprint_end_date
  )
  VALUES (
    NEW.project_id,
    NEW.sprint_number,
    COALESCE(NEW.committed_points, NEW.story_points_estimate, 0),
    COALESCE(NEW.delivered_points, 0),
    CASE 
      WHEN COALESCE(NEW.committed_points, NEW.story_points_estimate, 0) > 0 
      THEN (COALESCE(NEW.delivered_points, 0)::NUMERIC / COALESCE(NEW.committed_points, NEW.story_points_estimate, 1)) * 100
      ELSE 0 
    END,
    NEW.sprint_start_date,
    NEW.sprint_end_date
  )
  ON CONFLICT (project_id, sprint_number)
  DO UPDATE SET
    committed_points = EXCLUDED.committed_points,
    delivered_points = EXCLUDED.delivered_points,
    velocity = EXCLUDED.velocity,
    sprint_start_date = EXCLUDED.sprint_start_date,
    sprint_end_date = EXCLUDED.sprint_end_date,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger for velocity sync
DROP TRIGGER IF EXISTS trigger_sync_sprint_velocity ON public.sprint_planning_sessions;
CREATE TRIGGER trigger_sync_sprint_velocity
AFTER INSERT OR UPDATE ON public.sprint_planning_sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_sprint_velocity();

-- Step 5: Function to get project integration status (unified)
CREATE OR REPLACE FUNCTION public.get_unified_integrations(project_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'jira', jsonb_build_object(
      'active', COALESCE(upi.jira_active, false),
      'integration_id', upi.jira_integration_id,
      'board_url', upi.jira_board_url,
      'board_id', upi.jira_board_id
    ),
    'github', jsonb_build_object(
      'active', COALESCE(upi.github_active, false),
      'integration_id', upi.github_integration_id,
      'repo_url', upi.github_repo_url,
      'repo_name', upi.github_repo_name
    ),
    'microsoft', jsonb_build_object(
      'active', COALESCE(upi.microsoft_active, false),
      'integration_id', upi.microsoft_integration_id,
      'calendar_id', upi.outlook_calendar_id,
      'teams_channel_id', upi.teams_channel_id,
      'distribution_list', upi.team_distribution_list
    ),
    'slack', jsonb_build_object(
      'active', COALESCE(upi.slack_active, false),
      'integration_id', upi.slack_integration_id
    )
  ) INTO result
  FROM unified_project_integrations upi
  WHERE upi.project_id = project_id_param;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Step 6: Function to calculate commitment accuracy
CREATE OR REPLACE FUNCTION public.get_sprint_commitment_accuracy(project_id_param UUID, limit_sprints INTEGER DEFAULT 10)
RETURNS TABLE (
  sprint_number INTEGER,
  committed_points INTEGER,
  delivered_points INTEGER,
  accuracy_percentage NUMERIC,
  sprint_date DATE
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    svh.sprint_number,
    svh.committed_points,
    svh.delivered_points,
    CASE 
      WHEN svh.committed_points > 0 
      THEN ROUND((svh.delivered_points::NUMERIC / svh.committed_points) * 100, 1)
      ELSE 0 
    END as accuracy_percentage,
    COALESCE(svh.sprint_end_date, svh.created_at::DATE) as sprint_date
  FROM sprint_velocity_history svh
  WHERE svh.project_id = project_id_param
  ORDER BY svh.sprint_number DESC
  LIMIT limit_sprints;
$$;

-- Step 7: Function to get velocity trends
CREATE OR REPLACE FUNCTION public.get_velocity_trends(project_id_param UUID, limit_sprints INTEGER DEFAULT 12)
RETURNS TABLE (
  sprint_number INTEGER,
  velocity NUMERIC,
  delivered_points INTEGER,
  trend TEXT,
  sprint_date DATE
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  prev_velocity NUMERIC := 0;
BEGIN
  RETURN QUERY
  WITH velocity_with_trend AS (
    SELECT 
      svh.sprint_number,
      svh.velocity,
      svh.delivered_points,
      COALESCE(svh.sprint_end_date, svh.created_at::DATE) as sprint_date,
      LAG(svh.delivered_points) OVER (ORDER BY svh.sprint_number) as prev_delivered
    FROM sprint_velocity_history svh
    WHERE svh.project_id = project_id_param
    ORDER BY svh.sprint_number DESC
    LIMIT limit_sprints
  )
  SELECT 
    vwt.sprint_number,
    vwt.velocity,
    vwt.delivered_points,
    CASE 
      WHEN vwt.prev_delivered IS NULL THEN 'stable'
      WHEN vwt.delivered_points > vwt.prev_delivered THEN 'up'
      WHEN vwt.delivered_points < vwt.prev_delivered THEN 'down'
      ELSE 'stable'
    END::TEXT as trend,
    vwt.sprint_date
  FROM velocity_with_trend vwt
  ORDER BY vwt.sprint_number ASC;
END;
$$;