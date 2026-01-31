-- Add encrypted columns for jira_email and jira_site_url
ALTER TABLE public.user_jira_tokens
ADD COLUMN IF NOT EXISTS encrypted_jira_email TEXT,
ADD COLUMN IF NOT EXISTS encrypted_jira_site_url TEXT;

-- Update the safe view to show has_jira_email and has_jira_site_url instead of actual values
DROP VIEW IF EXISTS public.user_jira_tokens_safe;

CREATE VIEW public.user_jira_tokens_safe AS
SELECT 
  user_id,
  oauth_provider,
  cloud_id,
  scopes,
  is_valid,
  last_validated_at,
  validation_error,
  token_expires_at,
  created_at,
  updated_at,
  -- Boolean indicators instead of actual values
  (encrypted_jira_email IS NOT NULL OR jira_email IS NOT NULL) as has_jira_email,
  (encrypted_jira_site_url IS NOT NULL OR jira_site_url IS NOT NULL) as has_jira_site_url,
  (encrypted_token IS NOT NULL) as has_token,
  (refresh_token_encrypted IS NOT NULL) as has_refresh_token
FROM public.user_jira_tokens;

-- Grant access to the safe view
GRANT SELECT ON public.user_jira_tokens_safe TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.user_jira_tokens_safe IS 'Safe view for Jira tokens - exposes only metadata and boolean flags, never actual credentials or PII';
COMMENT ON COLUMN public.user_jira_tokens.encrypted_jira_email IS 'AES-256-GCM encrypted Jira email address';
COMMENT ON COLUMN public.user_jira_tokens.encrypted_jira_site_url IS 'AES-256-GCM encrypted Jira site URL';