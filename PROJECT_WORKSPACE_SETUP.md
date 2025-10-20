# Project Workspace Initialization - Complete Setup Guide

## Overview
This comprehensive feature allows you to initialize a complete Agile project workspace with one unified flow that integrates:
- **JIRA** for issue tracking
- **GitHub** for code repository management
- **Microsoft Outlook** for calendar and ceremony scheduling
- **Microsoft Teams** for team communication
- **Automated Scrum Ceremonies** (Sprint Planning, Daily Scrum, Sprint Review, Retrospective, Backlog Refinement)

## Prerequisites

### 1. Microsoft Azure App (Already Configured ✓)
- Application (Client) ID configured
- Client Secret stored securely
- Tenant ID configured
- Required permissions:
  - `Calendars.ReadWrite`
  - `offline_access`
  - `User.Read`
  - `Group.ReadWrite.All`
  - `Channel.Create`

### 2. JIRA API Token (Already Configured ✓)
- JIRA API token stored securely in Lovable Cloud

### 3. GitHub Personal Access Token (Already Configured ✓)
- GitHub token stored securely in Lovable Cloud

### 4. Update Frontend Configuration
In `src/pages/ProjectWorkspace.tsx`, line 17, replace:
```typescript
const MICROSOFT_CLIENT_ID = "YOUR_MICROSOFT_CLIENT_ID";
```
with your actual Microsoft Client ID from Azure Portal.

## How to Use

### Step 1: Navigate to Project Workspace Initialization
1. Click on **"Initialize"** in the navigation bar
2. Or navigate directly to `/project-workspace`

### Step 2: Initialize Workspace

1. **Enter Workspace Details:**
   - **Project/Workspace Name**: Enter a descriptive name (e.g., "Q1 Product Launch")
   - **Team Distribution List**: Enter comma-separated email addresses of all team members
   - **Sprint Start Date**: Select when Sprint 1 should begin

2. **Connect Microsoft Services:**
   - Click "Connect" to authorize Outlook & Teams access
   - You'll be redirected to Microsoft login
   - Grant the required permissions
   - You'll be automatically redirected back

3. **Create Workspace:**
   - Click "Initialize Workspace & Create Ceremonies"
   - This will:
     - Create workspace record in the database
     - Schedule 5 Scrum ceremonies in Outlook:
       - **Sprint Planning**: 2 hours, every 2 weeks on Monday at 10:00 AM
       - **Daily Scrum**: 15 minutes, every weekday at 9:00 AM
       - **Sprint Review**: 1 hour, every 2 weeks on Friday at 2:00 PM
       - **Sprint Retrospective**: 90 minutes, every 2 weeks on Friday at 3:30 PM
       - **Backlog Refinement**: 1 hour, every Wednesday at 1:00 PM
     - Invite all team members to ceremonies
     - Generate calendar events with recurrence patterns

### Step 3: Connect Development Tools

1. **JIRA Integration:**
   - Enter your JIRA site URL (e.g., `https://yourcompany.atlassian.net`)
   - Enter the full JIRA board URL
   - Click "Connect JIRA"
   - Verifies connection and stores board details

2. **GitHub Integration:**
   - Enter your GitHub repository URL (e.g., `https://github.com/username/repo`)
   - Click "Connect GitHub"
   - Verifies access and stores repository information

3. **Microsoft Teams:**
   - Click "Setup Teams Channel"
   - Automatically creates a dedicated channel for your project
   - The channel will be created in your primary Teams team
   - Team members can access it immediately

### Step 4: Review & Complete

1. Review the configuration summary showing:
   - ✅ Workspace created
   - ✅ Outlook ceremonies scheduled
   - ✅ JIRA board connected (if configured)
   - ✅ GitHub repo connected (if configured)
   - ✅ Teams channel created (if configured)

2. Click "Complete Setup & Go to Dashboard"
3. Your team is now ready for Sprint 1!

## Database Schema

### project_workspaces Table
Stores workspace configuration and integration details:
- `id`: Unique workspace identifier
- `project_id`: Link to parent project
- `name`: Workspace name
- `jira_board_url`: JIRA board link
- `jira_board_id`: Extracted board ID
- `github_repo_url`: GitHub repository link
- `github_repo_name`: Repository full name
- `outlook_calendar_id`: Outlook calendar ID
- `teams_channel_id`: Teams channel ID
- `team_distribution_list`: Team member emails
- `configuration_status`: pending/initializing/ready

### ceremony_configs Table
Stores individual ceremony configurations:
- `id`: Unique ceremony identifier
- `workspace_id`: Link to workspace
- `ceremony_type`: Type of ceremony
- `outlook_event_id`: Outlook calendar event ID
- `recurrence_pattern`: iCal recurrence pattern
- `attendees`: Array of attendee emails
- `start_time`: Ceremony start time
- `duration_minutes`: Duration in minutes
- `is_active`: Whether ceremony is active

## Edge Functions

### 1. initialize-workspace
**Purpose**: Creates workspace and schedules all Scrum ceremonies

**Input**:
```json
{
  "projectId": "uuid",
  "workspaceName": "string",
  "teamDistributionList": "email1@domain.com, email2@domain.com",
  "accessToken": "microsoft_access_token",
  "startDate": "2025-01-20"
}
```

**Output**:
```json
{
  "success": true,
  "workspaceId": "uuid",
  "ceremoniesCreated": ["Sprint Planning", "Daily Scrum", ...]
}
```

### 2. connect-jira
**Purpose**: Validates and stores JIRA board connection

**Input**:
```json
{
  "jiraBoardUrl": "https://company.atlassian.net/jira/software/c/projects/PROJ/boards/1",
  "jiraSiteUrl": "https://company.atlassian.net",
  "workspaceId": "uuid"
}
```

**Output**:
```json
{
  "success": true,
  "boardName": "Project Board",
  "boardId": "1"
}
```

### 3. connect-github
**Purpose**: Validates and stores GitHub repository connection

**Input**:
```json
{
  "githubRepoUrl": "https://github.com/username/repo",
  "workspaceId": "uuid"
}
```

**Output**:
```json
{
  "success": true,
  "repoName": "username/repo",
  "repoDescription": "Repository description",
  "defaultBranch": "main"
}
```

### 4. setup-teams-channel
**Purpose**: Creates a dedicated Microsoft Teams channel

**Input**:
```json
{
  "accessToken": "microsoft_access_token",
  "workspaceId": "uuid",
  "projectName": "Project Name"
}
```

**Output**:
```json
{
  "success": true,
  "channelId": "channel_id",
  "channelName": "Project: Project Name",
  "teamName": "Team Name"
}
```

## Security Considerations

### Row-Level Security (RLS)
- All workspace and ceremony data protected by RLS policies
- Users can only access workspaces for projects they're members of
- Ceremony configurations inherit workspace access rules

### API Tokens & Secrets
1. **Microsoft Credentials** (Private - Backend Only):
   - `MICROSOFT_CLIENT_SECRET`
   - `MICROSOFT_TENANT_ID`

2. **Microsoft Client ID** (Public - Frontend):
   - Safe to include in frontend code
   - Required for OAuth flow initiation

3. **JIRA API Token** (Private - Backend Only):
   - `JIRA_API_TOKEN`
   - Used in edge functions only

4. **GitHub Token** (Private - Backend Only):
   - `GITHUB_TOKEN`
   - Used in edge functions only

5. **Microsoft Access Token** (User-Specific):
   - Stored in browser localStorage
   - Valid for 1 hour
   - Used for Microsoft Graph API calls

## Ceremony Details

### Sprint Planning
- **Duration**: 2 hours
- **Recurrence**: Every 2 weeks on Monday
- **Time**: 10:00 AM
- **Purpose**: Plan the upcoming sprint with the team

### Daily Scrum
- **Duration**: 15 minutes
- **Recurrence**: Every weekday (Monday-Friday)
- **Time**: 9:00 AM
- **Purpose**: Quick daily sync with the team

### Sprint Review
- **Duration**: 1 hour
- **Recurrence**: Every 2 weeks on Friday
- **Time**: 2:00 PM
- **Purpose**: Demo completed work to stakeholders

### Sprint Retrospective
- **Duration**: 90 minutes
- **Recurrence**: Every 2 weeks on Friday
- **Time**: 3:30 PM
- **Purpose**: Reflect and improve team processes

### Backlog Refinement
- **Duration**: 1 hour
- **Recurrence**: Every Wednesday
- **Time**: 1:00 PM
- **Purpose**: Groom and prioritize backlog items

## Troubleshooting

### "No project found" Error
- Ensure you're logged in as a user with project access
- Create a project first from the Dashboard
- Check that you're a member of the project

### Microsoft Connection Issues
- Verify Client ID is correctly set in `ProjectWorkspace.tsx`
- Check redirect URI matches in Azure Portal
- Ensure all required API permissions are granted
- Try clearing browser cache and localStorage

### JIRA Connection Failures
- Verify JIRA site URL format (should include https://)
- Ensure board URL is complete and valid
- Check that API token has correct permissions
- Confirm board ID can be extracted from URL

### GitHub Connection Failures
- Verify repository URL format
- Ensure GitHub token has `repo` scope
- Check that repository exists and is accessible
- Confirm token hasn't expired

### Teams Channel Creation Issues
- Ensure you have at least one Team in Microsoft Teams
- Verify you have permissions to create channels
- Check that access token is valid and not expired
- Try reconnecting to Microsoft if token is stale

## Future Enhancements

### Planned Features
- [ ] Support for multiple project templates (Kanban, SAFe, etc.)
- [ ] Custom ceremony templates with user-defined schedules
- [ ] Automatic team member synchronization from JIRA/GitHub
- [ ] Integration with additional tools (Slack, Azure DevOps, etc.)
- [ ] Analytics dashboard for ceremony attendance
- [ ] Automated meeting summaries using AI
- [ ] Calendar sync to show existing ceremonies in app
- [ ] Timezone support for distributed teams
- [ ] Bulk workspace creation for multiple projects
- [ ] Integration health monitoring and alerts

### Potential Integrations
- **Slack**: Team notifications and ceremony reminders
- **Azure DevOps**: Work item synchronization
- **Confluence**: Documentation linking
- **Zoom**: Meeting link automation
- **ServiceNow**: Incident tracking integration

## Support & Documentation

### Related Features
- **Ceremony Setup** (`/ceremony-setup`): Single ceremony creation
- **Integrations** (`/integrations`): View and manage all integrations
- **Dashboard** (`/dashboard`): Main project overview

### Additional Resources
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Azure AD OAuth 2.0](https://docs.microsoft.com/en-us/azure/active-directory/develop/)

## Notes

- This feature is designed for Scrum teams following standard Agile practices
- All ceremonies are created with recurrence patterns by default
- Team members receive Outlook meeting invitations immediately
- Integrations can be configured partially (e.g., only JIRA without GitHub)
- Workspace configuration can be updated later through the Integrations page
- Security warning about leaked password protection is a general Supabase setting and doesn't affect this feature