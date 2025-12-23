-- Add encrypted token columns to user_microsoft_tokens table
ALTER TABLE public.user_microsoft_tokens 
ADD COLUMN IF NOT EXISTS encrypted_access_token TEXT,
ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT;

-- Add a comment explaining the encryption
COMMENT ON COLUMN public.user_microsoft_tokens.encrypted_access_token IS 'AES-256-GCM encrypted access token';
COMMENT ON COLUMN public.user_microsoft_tokens.encrypted_refresh_token IS 'AES-256-GCM encrypted refresh token';