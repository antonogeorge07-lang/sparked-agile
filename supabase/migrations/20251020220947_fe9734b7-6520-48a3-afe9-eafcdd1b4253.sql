-- Create table for project workspace configurations
CREATE TABLE IF NOT EXISTS public.project_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  jira_board_url TEXT,
  jira_board_id TEXT,
  github_repo_url TEXT,
  github_repo_name TEXT,
  outlook_calendar_id TEXT,
  teams_channel_id TEXT,
  team_distribution_list TEXT,
  configuration_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.project_workspaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Project members can view workspaces"
  ON public.project_workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = project_workspaces.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage workspaces"
  ON public.project_workspaces
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = project_workspaces.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Create table for ceremony configurations
CREATE TABLE IF NOT EXISTS public.ceremony_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  ceremony_type TEXT NOT NULL,
  outlook_event_id TEXT,
  recurrence_pattern TEXT,
  attendees TEXT[],
  start_time TIME,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES public.project_workspaces(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.ceremony_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view ceremony configs"
  ON public.ceremony_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_workspaces pw
      JOIN public.project_members pm ON pm.project_id = pw.project_id
      WHERE pw.id = ceremony_configs.workspace_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage ceremony configs"
  ON public.ceremony_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_workspaces pw
      JOIN public.project_members pm ON pm.project_id = pw.project_id
      WHERE pw.id = ceremony_configs.workspace_id
      AND pm.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_project_workspaces_updated_at
  BEFORE UPDATE ON public.project_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();