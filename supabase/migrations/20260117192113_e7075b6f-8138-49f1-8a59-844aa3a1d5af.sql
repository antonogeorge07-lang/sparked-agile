-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_slack_tokens_safe;
CREATE VIEW public.user_slack_tokens_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  team_id,
  team_name,
  channel_id,
  channel_name,
  scopes,
  is_valid,
  last_validated_at,
  validation_error,
  created_at,
  updated_at,
  CASE WHEN webhook_url IS NOT NULL AND webhook_url != '' THEN true ELSE false END as has_webhook,
  CASE WHEN encrypted_access_token IS NOT NULL THEN true ELSE false END as has_access_token,
  CASE WHEN encrypted_bot_token IS NOT NULL THEN true ELSE false END as has_bot_token
FROM public.user_slack_tokens;

GRANT SELECT ON public.user_slack_tokens_safe TO authenticated;