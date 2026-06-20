-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_jira_tokens_safe;

CREATE VIEW public.user_jira_tokens_safe 
WITH (security_invoker = true)
AS
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
COMMENT ON VIEW public.user_jira_tokens_safe IS 'Safe view for Jira tokens (SECURITY INVOKER) - exposes only metadata and boolean flags, never actual credentials or PII';