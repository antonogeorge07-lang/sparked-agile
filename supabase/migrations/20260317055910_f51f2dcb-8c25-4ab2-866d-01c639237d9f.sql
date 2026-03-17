
-- Add jira_epic_key to epics table for linking to Jira epics
ALTER TABLE public.epics ADD COLUMN IF NOT EXISTS jira_epic_key TEXT;

-- Add jira_issue_key to features table for dedup matching
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS jira_issue_key TEXT;

-- Add jira_url to features for quick reference
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS jira_url TEXT;

-- Unique constraint on jira_issue_key per epic to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS features_jira_issue_key_epic_unique 
ON public.features (epic_id, jira_issue_key) 
WHERE jira_issue_key IS NOT NULL;
