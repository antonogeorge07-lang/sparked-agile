-- Create project_tasks table for SAFe AGILE workspace projects
CREATE TABLE public.project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  owner text,
  status text NOT NULL DEFAULT 'To-Do',
  stage text NOT NULL DEFAULT 'initiation',
  start_date date,
  due_date date,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes text,
  dependencies text[],
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies using existing security definer functions
CREATE POLICY "Project members can view project tasks"
ON public.project_tasks
FOR SELECT
USING (can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can create project tasks"
ON public.project_tasks
FOR INSERT
WITH CHECK (can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can update project tasks"
ON public.project_tasks
FOR UPDATE
USING (can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can delete project tasks"
ON public.project_tasks
FOR DELETE
USING (can_access_workspace_project(project_id, auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_project_tasks_updated_at
BEFORE UPDATE ON public.project_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();