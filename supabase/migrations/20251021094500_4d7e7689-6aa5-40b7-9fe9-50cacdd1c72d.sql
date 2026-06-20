-- Create usage analytics tables

-- Track AI API calls
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID,
  model TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_estimate NUMERIC(10, 6),
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track user activity
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  page TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track project usage metrics
CREATE TABLE IF NOT EXISTS public.project_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  date DATE NOT NULL,
  active_users INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  ai_calls INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, date)
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert AI usage"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activity_logs
CREATE POLICY "Users can view their own activity"
  ON public.user_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
  ON public.user_activity_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert activity"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for project_usage_stats
CREATE POLICY "Project members can view usage stats"
  ON public.project_usage_stats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = project_usage_stats.project_id
    AND project_members.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all usage stats"
  ON public.project_usage_stats FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert usage stats"
  ON public.project_usage_stats FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = project_usage_stats.project_id
    AND project_members.user_id = auth.uid()
  ));

CREATE POLICY "System can update usage stats"
  ON public.project_usage_stats FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = project_usage_stats.project_id
    AND project_members.user_id = auth.uid()
  ));

-- Add updated_at trigger
CREATE TRIGGER update_project_usage_stats_updated_at
  BEFORE UPDATE ON public.project_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_project_usage_stats_project_date ON public.project_usage_stats(project_id, date DESC);