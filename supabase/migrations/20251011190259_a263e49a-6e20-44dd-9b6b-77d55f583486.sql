-- Create projects table to organize team data
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create standup updates table
CREATE TABLE IF NOT EXISTS public.standup_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  yesterday TEXT NOT NULL,
  today TEXT NOT NULL,
  blockers TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI-extracted action items
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'blocked')),
  assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  source_type TEXT CHECK (source_type IN ('standup', 'retrospective', 'planning', 'manual')),
  source_id UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create sprint summaries table
CREATE TABLE IF NOT EXISTS public.sprint_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_number INTEGER,
  summary TEXT NOT NULL,
  key_achievements TEXT[],
  blockers_identified TEXT[],
  action_items_generated INTEGER DEFAULT 0,
  ai_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow execution log
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('standup_analysis', 'sprint_extraction', 'retro_insights', 'custom')),
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standup_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode - adjust for production)
CREATE POLICY "Allow public read access to projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert to projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to projects" ON public.projects FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert to team_members" ON public.team_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to standup_updates" ON public.standup_updates FOR SELECT USING (true);
CREATE POLICY "Allow public insert to standup_updates" ON public.standup_updates FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to action_items" ON public.action_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert to action_items" ON public.action_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to action_items" ON public.action_items FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to sprint_summaries" ON public.sprint_summaries FOR SELECT USING (true);
CREATE POLICY "Allow public insert to sprint_summaries" ON public.sprint_summaries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to workflow_executions" ON public.workflow_executions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to workflow_executions" ON public.workflow_executions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to workflow_executions" ON public.workflow_executions FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_standup_updates_project ON public.standup_updates(project_id);
CREATE INDEX idx_action_items_project ON public.action_items(project_id);
CREATE INDEX idx_action_items_status ON public.action_items(status);
CREATE INDEX idx_workflow_executions_project ON public.workflow_executions(project_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);