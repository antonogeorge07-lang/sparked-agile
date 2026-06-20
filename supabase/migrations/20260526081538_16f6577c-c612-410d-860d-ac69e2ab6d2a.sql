ALTER TABLE public.user_jira_tokens
  ALTER COLUMN jira_email DROP NOT NULL,
  ALTER COLUMN jira_site_url DROP NOT NULL;