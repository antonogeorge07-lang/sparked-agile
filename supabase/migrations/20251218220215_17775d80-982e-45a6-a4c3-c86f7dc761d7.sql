-- Add github_token column to integrations table config (already JSON, so we'll store token there)
-- Create a dedicated table for storing user GitHub tokens securely
CREATE TABLE IF NOT EXISTS public.user_github_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_token TEXT NOT NULL,
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_github_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view/manage their own token
CREATE POLICY "Users can view their own GitHub token"
ON public.user_github_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub token"
ON public.user_github_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub token"
ON public.user_github_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub token"
ON public.user_github_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_github_tokens_updated_at
BEFORE UPDATE ON public.user_github_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();