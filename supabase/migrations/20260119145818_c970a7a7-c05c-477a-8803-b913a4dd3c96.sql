-- Drop legacy plaintext columns from user_github_tokens
-- Note: One user had plaintext token without encrypted version - they will need to re-authenticate
ALTER TABLE user_github_tokens DROP COLUMN IF EXISTS github_token;
ALTER TABLE user_github_tokens DROP COLUMN IF EXISTS refresh_token;

-- Drop legacy plaintext columns from user_jira_tokens  
ALTER TABLE user_jira_tokens DROP COLUMN IF EXISTS jira_token;
ALTER TABLE user_jira_tokens DROP COLUMN IF EXISTS refresh_token;

-- Add comment documenting the security improvement
COMMENT ON TABLE user_github_tokens IS 'GitHub OAuth tokens - encrypted only (plaintext columns removed 2026-01-19)';
COMMENT ON TABLE user_jira_tokens IS 'Jira OAuth tokens - encrypted only (plaintext columns removed 2026-01-19)';