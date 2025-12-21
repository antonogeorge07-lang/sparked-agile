-- Add OAuth columns to user_jira_tokens
ALTER TABLE public.user_jira_tokens 
ADD COLUMN IF NOT EXISTS encrypted_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS oauth_provider TEXT DEFAULT 'pat',
ADD COLUMN IF NOT EXISTS cloud_id TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT[];