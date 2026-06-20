
-- Fix 1: Add user_id filter to user_jira_tokens_safe view (defense-in-depth, matching other safe views)
CREATE OR REPLACE VIEW public.user_jira_tokens_safe AS
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
  ((encrypted_jira_email IS NOT NULL) OR (jira_email IS NOT NULL)) AS has_jira_email,
  ((encrypted_jira_site_url IS NOT NULL) OR (jira_site_url IS NOT NULL)) AS has_jira_site_url,
  (encrypted_token IS NOT NULL) AS has_token,
  (refresh_token_encrypted IS NOT NULL) AS has_refresh_token
FROM user_jira_tokens
WHERE user_id = auth.uid();

-- Fix 2: Add INSERT policy for integration_events (project members only)
CREATE POLICY "Project members can insert integration events"
ON public.integration_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = integration_events.project_id
    AND project_members.user_id = auth.uid()
  )
);
