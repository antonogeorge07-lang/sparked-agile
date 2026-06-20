-- Create table for sprint review sessions
CREATE TABLE IF NOT EXISTS public.sprint_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  workspace_id UUID,
  sprint_number INTEGER NOT NULL,
  completed_tickets JSONB,
  github_commits JSONB,
  demo_checklist TEXT[],
  achieved_objectives TEXT,
  stakeholder_feedback TEXT,
  delivered_features TEXT[],
  backlog_updates TEXT,
  outlook_event_id TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'preparing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES public.project_workspaces(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.sprint_review_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Project members can view sprint review sessions"
  ON public.sprint_review_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = sprint_review_sessions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage sprint review sessions"
  ON public.sprint_review_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = sprint_review_sessions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_sprint_review_sessions_updated_at
  BEFORE UPDATE ON public.sprint_review_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();