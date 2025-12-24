-- Create table for Slack tokens (similar to Microsoft/GitHub patterns)
CREATE TABLE public.user_slack_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT,
  encrypted_access_token TEXT NOT NULL,
  encrypted_bot_token TEXT,
  channel_id TEXT,
  channel_name TEXT,
  webhook_url TEXT,
  scopes TEXT[],
  is_valid BOOLEAN DEFAULT true,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  validation_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Enable RLS
ALTER TABLE public.user_slack_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own Slack tokens
CREATE POLICY "Users can manage own Slack tokens"
  ON public.user_slack_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create table for project Slack channel mappings
CREATE TABLE public.project_slack_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  slack_token_id UUID NOT NULL REFERENCES public.user_slack_tokens(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  notification_types TEXT[] DEFAULT ARRAY['ceremony_reminders', 'project_updates', 'ai_summaries'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, channel_id)
);

-- Enable RLS
ALTER TABLE public.project_slack_channels ENABLE ROW LEVEL SECURITY;

-- Project members can manage Slack channel mappings
CREATE POLICY "Project members can manage Slack channels"
  ON public.project_slack_channels
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = project_slack_channels.project_id
    AND project_members.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = project_slack_channels.project_id
    AND project_members.user_id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_user_slack_tokens_updated_at
  BEFORE UPDATE ON public.user_slack_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_slack_channels_updated_at
  BEFORE UPDATE ON public.project_slack_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();