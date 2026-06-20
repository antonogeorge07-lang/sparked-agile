-- Create table for sprint planning sessions
CREATE TABLE IF NOT EXISTS public.sprint_planning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  workspace_id UUID,
  sprint_number INTEGER NOT NULL,
  sprint_goal TEXT,
  velocity_data JSONB,
  backlog_items JSONB,
  story_points_estimate INTEGER,
  agenda TEXT,
  discussion_topics TEXT[],
  outlook_event_id TEXT,
  meeting_minutes TEXT,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES public.project_workspaces(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.sprint_planning_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Project members can view sprint planning sessions"
  ON public.sprint_planning_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = sprint_planning_sessions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage sprint planning sessions"
  ON public.sprint_planning_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = sprint_planning_sessions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_sprint_planning_sessions_updated_at
  BEFORE UPDATE ON public.sprint_planning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();