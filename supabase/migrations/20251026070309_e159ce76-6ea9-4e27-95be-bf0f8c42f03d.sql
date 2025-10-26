-- Create ceremony_reminders table to track scheduled reminders
CREATE TABLE IF NOT EXISTS public.ceremony_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  ceremony_type TEXT NOT NULL CHECK (ceremony_type IN ('standup', 'retrospective', 'sprint_planning', 'sprint_review', 'backlog_refinement')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ceremony_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for ceremony_reminders
CREATE POLICY "Users can view reminders for their projects"
  ON public.ceremony_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = ceremony_reminders.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reminders for their projects"
  ON public.ceremony_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = ceremony_reminders.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders for their projects"
  ON public.ceremony_reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = ceremony_reminders.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ceremony_reminders_updated_at
  BEFORE UPDATE ON public.ceremony_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_ceremony_reminders_scheduled ON public.ceremony_reminders(scheduled_time, status);
CREATE INDEX idx_ceremony_reminders_project ON public.ceremony_reminders(project_id);