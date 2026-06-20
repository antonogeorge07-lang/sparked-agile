-- Create projects table for Project Command Centre
CREATE TABLE IF NOT EXISTS public.pmi_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table following PMI stages
CREATE TABLE IF NOT EXISTS public.pmi_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'To-Do',
  stage TEXT NOT NULL DEFAULT 'initiation',
  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pmi_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmi_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pmi_projects
CREATE POLICY "Users can view their own projects"
  ON public.pmi_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.pmi_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.pmi_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.pmi_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pmi_tasks
CREATE POLICY "Users can view tasks in their projects"
  ON public.pmi_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pmi_projects
      WHERE pmi_projects.id = pmi_tasks.project_id
      AND pmi_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their projects"
  ON public.pmi_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pmi_projects
      WHERE pmi_projects.id = pmi_tasks.project_id
      AND pmi_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their projects"
  ON public.pmi_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pmi_projects
      WHERE pmi_projects.id = pmi_tasks.project_id
      AND pmi_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their projects"
  ON public.pmi_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pmi_projects
      WHERE pmi_projects.id = pmi_tasks.project_id
      AND pmi_projects.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_pmi_projects_user_id ON public.pmi_projects(user_id);
CREATE INDEX idx_pmi_tasks_project_id ON public.pmi_tasks(project_id);
CREATE INDEX idx_pmi_tasks_stage ON public.pmi_tasks(stage);

-- Create trigger for updated_at on pmi_projects
CREATE TRIGGER update_pmi_projects_updated_at
  BEFORE UPDATE ON public.pmi_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on pmi_tasks
CREATE TRIGGER update_pmi_tasks_updated_at
  BEFORE UPDATE ON public.pmi_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();