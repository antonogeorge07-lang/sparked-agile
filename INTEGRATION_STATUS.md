# Integration Points Status Report

## Overview
The application has **TWO SEPARATE integration systems** that need consolidation:

### System 1: `integrations` table (New System)
- **Used by**: Integrations page, BacklogRefinement page
- **Storage**: JSON config in `integrations.config` column
- **Auth method**: Basic Auth (email + token for Jira)
- **Status**: ⚠️ **MISSING EMAIL** for existing records

### System 2: `project_workspaces` table (Legacy System)  
- **Used by**: Most other features (Sprint Planning, Task Management, etc.)
- **Storage**: Individual columns (jira_board_url, github_repo_url, etc.)
- **Auth method**: Bearer Token
- **Status**: ✅ Active but separate from new system

---

## Critical Issues Found

### 🔴 HIGH PRIORITY

1. **Missing Email in Jira Config**
   - **Table**: `integrations`
   - **Issue**: Existing Jira integration only has `url` and `apiToken`, missing `email`
   - **Impact**: `analyze-backlog-health` function fails with "undefined" domain and project key
   - **Fixed**: Edge function now handles both old and new format
   - **Action Needed**: Users must reconfigure integration to add email

2. **Dual Integration Systems**
   - **Issue**: Two separate tables storing integration data
   - **Impact**: Configuration fragmentation, data inconsistency
   - **Affected Functions**:
     - New system: `analyze-backlog-health`
     - Old system: `fetch-jira-backlog`, `update-jira-issue`, `fetch-github-issues`, etc.

### ⚠️ MEDIUM PRIORITY

3. **Authentication Method Inconsistency**
   - **New system (integrations)**: Uses Basic Auth with email:token
   - **Old system (project_workspaces)**: Uses Bearer Token
   - **Impact**: Different auth requirements across features

---

## Integration Points by Feature

### Jira Integration

#### Edge Functions Using **integrations** table:
- ✅ `analyze-backlog-health` - Backlog health analysis with AI
  - **Fixed**: Now handles missing domain/project_key/email
  - **Status**: Needs email in config to work fully

#### Edge Functions Using **project_workspaces** table:
- ✅ `fetch-jira-backlog` - Fetch backlog items
- ✅ `update-jira-issue` - Update issue details
- ✅ `connect-jira` - Initial connection setup
- ✅ `fetch-sprint-completed-work` - Sprint review data
- ✅ `generate-sprint-planning` - AI sprint planning (uses backlog data)
- ✅ `record-sprint-minutes` - Records sprint ceremonies

#### Pages Using Jira:
- 📄 **Integrations** (`/integrations`) - Uses `integrations` table
- 📄 **BacklogRefinement** (`/backlog-refinement`) - Uses `integrations` table
- 📄 **SprintPlanningAssistant** (`/sprint-planning-assistant`) - Uses `project_workspaces`
- 📄 **SprintReviewCoordinator** (`/sprint-review-coordinator`) - Uses `project_workspaces`
- 📄 **TaskManagement** (`/task-management`) - Uses `project_workspaces`
- 📄 **ProjectWorkspace** (`/project-workspace`) - Sets up `project_workspaces`

### GitHub Integration

#### Edge Functions Using **project_workspaces** table:
- ✅ `fetch-github-issues` - Fetch open issues
- ✅ `update-github-issue` - Update issue details  
- ✅ `connect-github` - Initial connection setup

#### Pages Using GitHub:
- 📄 **Integrations** (`/integrations`) - Uses `integrations` table
- 📄 **TaskManagement** (`/task-management`) - Uses `project_workspaces`
- 📄 **ProjectWorkspace** (`/project-workspace`) - Sets up `project_workspaces`

### Microsoft Outlook Integration

#### Edge Functions:
- ✅ `get-microsoft-token` - OAuth token exchange
- ✅ `get-microsoft-client-id` - Get client ID for OAuth
- ✅ `create-outlook-event` - Create calendar events
- ✅ `create-sprint-outlook-invite` - Sprint planning invites
- ✅ `create-review-outlook-invite` - Sprint review invites
- ✅ `setup-teams-channel` - Create Teams channels

#### Pages Using Outlook:
- 📄 **CeremonySetup** (`/ceremony-setup`) - Schedule ceremonies
- 📄 **SprintPlanningAssistant** - Send invites
- 📄 **SprintReviewCoordinator** - Send invites and wrap-ups
- 📄 **ProjectWorkspace** - Initial OAuth connection

### AI Features (Lovable AI)

#### Edge Functions:
- ✅ `analyze-backlog-health` - Backlog analysis with AI (uses Jira data)
- ✅ `generate-sprint-planning` - AI sprint planning suggestions
- ✅ `generate-retro-insights` - Retrospective insights
- ✅ `generate-standup-summary` - Daily standup summaries
- ✅ `generate-demo-checklist` - Sprint review checklists
- ✅ `generate-epic-closure-insights` - Epic closure analysis
- ✅ `generate-video-script` - Video script generation
- ✅ `chat` - AI chat assistant
- ✅ `market-research` - Market intelligence

### Other Features

#### Email:
- ✅ `send-welcome-email` - New user welcome
- ✅ `send-contact-email` - Contact form submissions
- ✅ `send-bulk-reminder` - Bulk reminder emails
- ✅ `send-scheduled-reminder` - Scheduled reminders
- ✅ `send-review-wrapup` - Sprint review summaries

#### Workflow:
- ✅ `process-workflow` - Workflow automation

#### Team:
- ✅ `add-team-member` - Add team members
- ✅ `initialize-workspace` - Initialize project workspace

---

## Database Schema

### `integrations` Table Columns:
- `id` (uuid)
- `project_id` (uuid) - FK to projects
- `integration_type` (text) - 'jira' | 'github' | 'outlook'
- `name` (text)
- `config` (jsonb) - Stores: url, email, apiToken, repository, organization
- `is_active` (boolean)
- `created_at`, `updated_at`

### `project_workspaces` Table Columns:
- `id` (uuid)
- `project_id` (uuid) - FK to projects
- `name` (text)
- `jira_board_url` (text)
- `jira_board_id` (text)
- `github_repo_url` (text)
- `github_repo_name` (text)
- `outlook_calendar_id` (text)
- `teams_channel_id` (text)
- `team_distribution_list` (text)
- `configuration_status` (text)
- `created_at`, `updated_at`

---

## Environment Variables / Secrets

### Required Secrets:
✅ `JIRA_API_TOKEN` - Jira authentication
✅ `GITHUB_TOKEN` - GitHub authentication
✅ `MICROSOFT_CLIENT_ID` - Microsoft OAuth
✅ `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth
✅ `MICROSOFT_TENANT_ID` - Microsoft tenant
✅ `LOVABLE_API_KEY` - AI features (auto-configured)
✅ `RESEND_API_KEY` - Email sending
✅ `PERPLEXITY_API_KEY` - Market research
✅ `SUPABASE_URL` - Auto-configured
✅ `SUPABASE_ANON_KEY` - Auto-configured
✅ `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured

---

## Recommendations

### 🎯 Immediate Actions (P0):

1. **Migrate to Single Integration System**
   - Consolidate `project_workspaces` into `integrations` table
   - Update all edge functions to use `integrations` table
   - Create migration script for existing data

2. **Standardize Authentication**
   - Choose one auth method (recommend Basic Auth with email)
   - Update all Jira edge functions consistently

3. **Add Email Field to Existing Integrations**
   - Update existing Jira integrations to include email
   - Make email required for new Jira integrations (already done in wizard)

### 📋 Short-term Improvements (P1):

4. **Add Integration Health Monitoring**
   - Track API call success/failure rates
   - Log authentication errors
   - Alert on configuration issues

5. **Improve Error Messages**
   - Show specific missing configuration details
   - Guide users to fix integration issues

6. **Add Integration Testing**
   - Test connection before saving
   - Validate credentials
   - Check API permissions

### 🔮 Long-term Enhancements (P2):

7. **Add Integration UI in Settings**
   - Unified integration management dashboard
   - Real-time connection status
   - Usage statistics per integration

8. **Support Multiple Integrations per Type**
   - Allow multiple Jira instances per project
   - Multiple GitHub repos per project

9. **Add Webhook Support**
   - Real-time updates from Jira/GitHub
   - Reduce API polling

---

## Testing Checklist

### Jira Integration:
- [ ] Can connect to Jira with URL and API token
- [ ] Email field is collected and stored
- [ ] Can fetch backlog items
- [ ] Can update issues
- [ ] AI backlog analysis works
- [ ] Sprint planning fetches correct data

### GitHub Integration:
- [ ] Can connect to GitHub repo
- [ ] Can fetch open issues
- [ ] Can update issues
- [ ] Commit data pulls correctly

### Microsoft Integration:
- [ ] OAuth flow completes successfully
- [ ] Can create calendar events
- [ ] Can create Teams channels
- [ ] Invites are sent correctly

### AI Features:
- [ ] All AI functions handle rate limits (429)
- [ ] All AI functions handle payment errors (402)
- [ ] Error messages are user-friendly
- [ ] AI responses are parsed correctly

---

## Integration Point Summary

**Total Edge Functions**: 33
- Jira: 7 functions
- GitHub: 3 functions  
- Microsoft: 6 functions
- AI: 9 functions
- Email: 5 functions
- Other: 3 functions

**Total Pages Using Integrations**: 10+
- Core integration pages: 2
- Agile ceremony pages: 5
- Task management: 1
- Project setup: 1
- AI features: Multiple

**Database Tables**: 2 (needs consolidation)
**Secrets Required**: 11
**Integration Types Supported**: 4 (Jira, GitHub, Microsoft, AI)
