-- Step 1: Make the legacy columns nullable (they may have NOT NULL constraint)
ALTER TABLE public.user_microsoft_tokens 
  ALTER COLUMN access_token DROP NOT NULL;

-- Step 2: Set any remaining plaintext tokens to NULL
-- (The encrypted versions should already exist for active tokens)
UPDATE public.user_microsoft_tokens
SET access_token = NULL,
    refresh_token = NULL,
    updated_at = now()
WHERE (access_token IS NOT NULL AND access_token != '')
   OR refresh_token IS NOT NULL;

-- Step 3: Drop the legacy plaintext columns
-- WARNING: This is irreversible - ensure all tokens are migrated first
ALTER TABLE public.user_microsoft_tokens
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token;

-- Add a comment explaining the security improvement
COMMENT ON TABLE public.user_microsoft_tokens IS 'Stores Microsoft OAuth tokens using AES-256-GCM encryption. Plaintext columns removed for security.';