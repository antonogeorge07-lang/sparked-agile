
-- 1. team_members: restrict SELECT to project membership only
DROP POLICY IF EXISTS "Project owners and admins can view team members" ON public.team_members;
CREATE POLICY "Project owners and admins can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = team_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = ANY (ARRAY['owner'::text, 'admin'::text])
  )
);

-- 2. Rebuild user_jira_tokens_safe without plaintext refs, then drop columns
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
  encrypted_jira_email IS NOT NULL AS has_jira_email,
  encrypted_jira_site_url IS NOT NULL AS has_jira_site_url,
  encrypted_token IS NOT NULL AS has_token,
  refresh_token_encrypted IS NOT NULL AS has_refresh_token
FROM public.user_jira_tokens
WHERE user_id = auth.uid();
GRANT SELECT ON public.user_jira_tokens_safe TO authenticated;

ALTER TABLE public.user_jira_tokens DROP COLUMN IF EXISTS jira_email;
ALTER TABLE public.user_jira_tokens DROP COLUMN IF EXISTS jira_site_url;

-- 3. Rebuild user_microsoft_token_status without user_email, then drop column
DROP VIEW IF EXISTS public.user_microsoft_token_status;
CREATE VIEW public.user_microsoft_token_status
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  is_valid,
  last_validated_at,
  validation_error,
  expires_at,
  created_at,
  updated_at
FROM public.user_microsoft_tokens
WHERE user_id = auth.uid();
GRANT SELECT ON public.user_microsoft_token_status TO authenticated;

ALTER TABLE public.user_microsoft_tokens DROP COLUMN IF EXISTS user_email;

-- 4. webhooks: prevent HMAC signing secret from being returned in SELECT
REVOKE SELECT (secret) ON public.webhooks FROM authenticated;
REVOKE SELECT (secret) ON public.webhooks FROM anon;

DROP VIEW IF EXISTS public.webhooks_safe;
CREATE VIEW public.webhooks_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  project_id,
  user_id,
  url,
  events,
  is_active,
  created_at,
  updated_at,
  (secret IS NOT NULL) AS has_secret
FROM public.webhooks;
GRANT SELECT ON public.webhooks_safe TO authenticated;
