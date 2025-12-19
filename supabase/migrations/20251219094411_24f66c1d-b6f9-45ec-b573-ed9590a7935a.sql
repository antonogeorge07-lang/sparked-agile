-- Create user_jira_tokens table for per-user Jira authentication
CREATE TABLE public.user_jira_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jira_token TEXT NOT NULL,
  jira_email TEXT NOT NULL,
  jira_site_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_jira_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only manage their own tokens
CREATE POLICY "Users can view their own Jira token"
  ON public.user_jira_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Jira token"
  ON public.user_jira_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Jira token"
  ON public.user_jira_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Jira token"
  ON public.user_jira_tokens
  FOR DELETE
  USING (auth.uid() = user_id);