
-- Recreate user_github_tokens_safe with reduced metadata exposure
DROP VIEW IF EXISTS public.user_github_tokens_safe;
CREATE VIEW public.user_github_tokens_safe
WITH (security_invoker=on) AS
SELECT 
  user_id,
  oauth_provider,
  is_valid,
  last_validated_at,
  token_expires_at,
  created_at,
  updated_at,
  (encrypted_token IS NOT NULL OR encrypted_access_token IS NOT NULL) AS has_token,
  (refresh_token_encrypted IS NOT NULL) AS has_refresh_token
FROM public.user_github_tokens
WHERE user_id = auth.uid();

COMMENT ON VIEW public.user_github_tokens_safe IS 
'Safe view exposing minimal GitHub token metadata. Excludes github_username, scopes, and validation_error to prevent metadata leakage.';
