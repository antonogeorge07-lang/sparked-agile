
-- Fix the security definer view issue by setting security_invoker = on
ALTER VIEW public.user_jira_tokens_safe SET (security_invoker = on);
