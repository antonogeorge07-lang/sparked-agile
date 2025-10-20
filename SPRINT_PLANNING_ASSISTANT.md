# Sprint Planning Assistant - AI-Powered Sprint Planning

## Overview
The Sprint Planning Assistant is an intelligent feature that automates and enhances sprint planning sessions by:
- **Fetching prioritized backlog** items directly from JIRA
- **Generating sprint plans** using AI based on team velocity and capacity
- **Creating Outlook invites** with complete agenda and JIRA links
- **Recording meeting minutes** with AI formatting
- **Automatically updating JIRA** with sprint commitments post-meeting

## Key Features

### 🤖 AI-Powered Planning
- Analyzes team velocity data to suggest realistic story point allocations
- Generates compelling sprint goals aligned with backlog priorities
- Creates structured meeting agendas with time allocations
- Identifies key discussion topics and potential risks

### 📊 JIRA Integration
- Pulls top prioritized backlog items automatically
- Displays item details: key, summary, priority, story points, type
- Allows selective item inclusion in sprint planning
- Updates JIRA automatically with finalized story points post-meeting

### 📅 Outlook Integration
- Creates professional calendar invites with rich HTML formatting
- Includes complete agenda and sprint goal
- Attaches JIRA board link for easy access
- Automatically invites all team members
- Generates Microsoft Teams meeting link

### ✍️ Meeting Minutes & Documentation
- AI formats meeting notes into professional minutes
- Extracts key decisions, action items, and commitments
- Saves complete sprint planning session to database
- Updates JIRA issues automatically

## Setup Requirements

### 1. Prerequisites
You must have completed the [Project Workspace Initialization](PROJECT_WORKSPACE_SETUP.md) which includes:
- JIRA board connected
- Microsoft Outlook/Teams connected
- Team members configured

### 2. Configuration
Update `src/pages/SprintPlanningAssistant.tsx`, line 20:
```typescript
const MICROSOFT_CLIENT_ID = "YOUR_MICROSOFT_CLIENT_ID";
```
Replace with your actual Microsoft Client ID from Azure Portal.

### 3. API Credentials (Already Configured ✓)
The following are pre-configured in Lovable Cloud:
- `LOVABLE_API_KEY` - For AI-powered features
- `JIRA_API_TOKEN` - For JIRA API access
- `MICROSOFT_CLIENT_ID` - OAuth client ID
- `MICROSOFT_CLIENT_SECRET` - OAuth secret
- `MICROSOFT_TENANT_ID` - Azure tenant ID

## How to Use

### Step 1: Sprint Configuration

1. **Navigate to Sprint Planning Assistant**
   - Click "Sprint AI" in the navigation bar
   - Or go directly to `/sprint-planning-assistant`

2. **Select Configuration**
   - Choose your project workspace (must have JIRA connected)
   - Enter sprint number (e.g., Sprint 5)
   - Set team size (used for capacity planning)

3. **Review Velocity Data**
   - System displays recent sprint velocity
   - Shows average points for planning guidance
   - AI uses this to suggest realistic commitments

4. **Connect Microsoft Services** (if not already)
   - Click "Connect" for Outlook
   - Authorize calendar access
   - Required for creating meeting invites

5. **Fetch JIRA Backlog**
   - Click "Fetch JIRA Backlog"
   - Retrieves top 20 prioritized items from your board
   - Items are sorted by priority

### Step 2: Select Backlog Items

1. **Review Backlog Items**
   - Each item shows: Key, Summary, Priority, Story Points, Type
   - Items are displayed in priority order
   - Click items to select/deselect for sprint planning

2. **Selection Strategy**
   - Select specific items you want to discuss
   - OR leave unselected to use top 10 by default
   - Consider team capacity and velocity

3. **Generate AI Plan**
   - Click "Generate Sprint Plan with AI"
   - AI analyzes:
     - Selected backlog items
     - Team velocity history
     - Team size and capacity
     - Item priorities and complexity
   - Takes 10-15 seconds to generate

### Step 3: Review Generated Plan

The AI generates a comprehensive sprint plan including:

1. **Sprint Goal** 🎯
   - Clear, compelling objective
   - Aligned with selected backlog items
   - Business value focused
   - Displayed prominently at top

2. **Story Points Estimate** 📊
   - Realistic allocation based on velocity
   - Accounts for team capacity
   - Includes buffer for unknowns
   - Compares to historical average

3. **Meeting Agenda** 📋
   - Complete structured agenda
   - Time allocations for each section
   - Discussion topics included
   - Editable before sending

4. **Discussion Topics** 💡
   - Key decisions required
   - Dependencies to identify
   - Capacity confirmation
   - Definition of done review

5. **Customize as Needed**
   - Edit the agenda directly
   - Adjust sprint goal if needed
   - Modify discussion topics
   - All changes are saved

6. **Set Meeting Date/Time**
   - Select date and time for sprint planning
   - Typically 2-hour duration
   - Consider team time zones

7. **Create Outlook Invite**
   - Click "Create Outlook Invite & Send to Team"
   - Generates professional HTML email with:
     - Sprint goal highlighted
     - Complete agenda
     - JIRA board link
     - Preparation tips
   - Automatically invites all team members
   - Creates Teams meeting link
   - Adds to everyone's calendar

### Step 4: Conduct Meeting & Record Minutes

After the sprint planning meeting:

1. **Open Meeting Minutes Page**
   - Navigate back to Sprint Planning Assistant
   - Go to "Meeting Minutes" tab
   - Confirmation shown that invite was sent

2. **Enter Meeting Notes**
   - Document key decisions made
   - Note any estimate adjustments
   - Record identified risks/blockers
   - Capture action items
   - Include any scope changes

3. **Record & Process**
   - Click "Record Minutes & Update JIRA"
   - AI processes notes into structured format:
     - Executive summary
     - Key decisions
     - Action items with owners
     - Sprint commitments
     - Risks and dependencies
     - Next steps
   - Saves to database
   - Updates JIRA issues with:
     - Story point estimates
     - Sprint assignment
     - Any status changes

4. **Automatic Updates**
   - JIRA issues updated automatically
   - Meeting minutes saved
   - Sprint session stored in database
   - Ready for sprint execution

## Database Schema

### sprint_planning_sessions Table
Complete record of each sprint planning session:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique session identifier |
| project_id | UUID | Link to project |
| workspace_id | UUID | Link to workspace |
| sprint_number | INTEGER | Sprint number |
| sprint_goal | TEXT | AI-generated sprint goal |
| velocity_data | JSONB | Historical velocity data |
| backlog_items | JSONB | Selected JIRA items |
| story_points_estimate | INTEGER | Total estimated points |
| agenda | TEXT | Complete meeting agenda |
| discussion_topics | TEXT[] | Key discussion topics |
| outlook_event_id | TEXT | Outlook calendar event ID |
| meeting_minutes | TEXT | Formatted meeting minutes |
| status | TEXT | planned/completed |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| created_by | UUID | User who created session |

## Edge Functions

### 1. generate-sprint-planning

**Purpose**: Generate AI-powered sprint plan based on backlog and velocity

**Input**:
```json
{
  "sprintNumber": 5,
  "backlogItems": [
    {
      "key": "PROJ-123",
      "summary": "Add user authentication",
      "priority": "High",
      "storyPoints": 8
    }
  ],
  "velocityData": [
    { "sprint": 2, "points": 28 },
    { "sprint": 3, "points": 32 },
    { "sprint": 4, "points": 30 }
  ],
  "projectName": "E-Commerce Platform",
  "teamSize": 6
}
```

**Output**:
```json
{
  "success": true,
  "sprintGoal": "Deliver core user management and authentication features",
  "storyPointsEstimate": 32,
  "agenda": "# Sprint 5 Planning Agenda\n\n1. Review Sprint 4...",
  "discussionTopics": [
    "Review and refine story estimates",
    "Identify dependencies and blockers",
    "Confirm team capacity"
  ],
  "velocityUsed": 30
}
```

**AI Processing**:
- Uses Lovable AI (google/gemini-2.5-flash)
- Analyzes velocity trends
- Considers team capacity
- Evaluates backlog priorities
- Generates structured output

### 2. fetch-jira-backlog

**Purpose**: Retrieve prioritized backlog items from JIRA board

**Input**:
```json
{
  "workspaceId": "uuid",
  "maxResults": 20
}
```

**Output**:
```json
{
  "success": true,
  "backlogItems": [
    {
      "key": "PROJ-123",
      "summary": "Implement user authentication",
      "description": "Add OAuth and JWT authentication...",
      "priority": "High",
      "status": "To Do",
      "storyPoints": 8,
      "assignee": "John Doe",
      "issueType": "Story",
      "labels": ["backend", "security"],
      "url": "https://company.atlassian.net/browse/PROJ-123"
    }
  ],
  "totalCount": 45
}
```

**JIRA API Usage**:
- Endpoint: `/rest/agile/1.0/board/{boardId}/backlog`
- Authentication: Bearer token
- Extracts relevant fields
- Transforms to simplified format

### 3. create-sprint-outlook-invite

**Purpose**: Create professional Outlook calendar invite with rich formatting

**Input**:
```json
{
  "accessToken": "microsoft_access_token",
  "sprintNumber": 5,
  "agenda": "Complete agenda text...",
  "sprintGoal": "Deliver user management features",
  "jiraBacklogUrl": "https://company.atlassian.net/jira/software/c/projects/PROJ/boards/1",
  "attendees": ["user1@company.com", "user2@company.com"],
  "startDateTime": "2025-01-27T10:00:00Z",
  "durationMinutes": 120
}
```

**Output**:
```json
{
  "success": true,
  "eventId": "AAMkAGI1AAAt9AHjAAA=",
  "webLink": "https://outlook.office365.com/...",
  "onlineMeeting": {
    "joinUrl": "https://teams.microsoft.com/l/meetup-join/..."
  }
}
```

**Email Format**:
- Professional HTML formatting
- Sprint goal highlighted
- Structured agenda
- JIRA link with context
- Preparation tips
- Teams meeting link

### 4. record-sprint-minutes

**Purpose**: Format meeting notes with AI and update JIRA

**Input**:
```json
{
  "sessionId": "uuid",
  "meetingNotes": "Team discussed priorities...",
  "finalizedItems": [
    {
      "key": "PROJ-123",
      "summary": "Add authentication",
      "storyPoints": 8
    }
  ],
  "updateJira": true,
  "jiraBoardId": "1",
  "jiraSiteUrl": "https://company.atlassian.net"
}
```

**Output**:
```json
{
  "success": true,
  "formattedMinutes": "# Sprint 5 Planning Minutes\n\n## Executive Summary...",
  "itemsUpdated": 8
}
```

**AI Processing**:
- Formats notes into structured minutes
- Extracts action items
- Identifies decisions
- Highlights risks
- Professional documentation

**JIRA Updates**:
- Updates story points
- Sets sprint field
- Modifies status if needed
- Bulk update for efficiency

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Sprint Planning Workflow                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  1. Configuration │
                    │  - Select workspace│
                    │  - Set sprint #   │
                    │  - Team size      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 2. Fetch Backlog │
                    │   from JIRA      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 3. Select Items  │
                    │  (or use top 10) │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 4. AI Generates  │
                    │   Sprint Plan    │
                    │  - Goal          │
                    │  - Agenda        │
                    │  - Estimates     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 5. Review & Edit │
                    │  Customize plan  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 6. Create Outlook│
                    │    Invite        │
                    │  - Sends to team │
                    │  - Teams link    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 7. Conduct       │
                    │    Meeting       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ 8. Record Minutes│
                    │  - AI formats    │
                    │  - Update JIRA   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Sprint Starts!  │
                    └──────────────────┘
```

## AI Prompt Engineering

### System Prompt
```
You are an expert Agile coach and sprint planning assistant. 
Your role is to help teams plan effective sprints that are 
realistic, achievable, and aligned with business goals.
```

### User Prompt Template
```
Generate a comprehensive Sprint Planning agenda for Sprint {number} 
for "{projectName}".

Team Context:
- Team size: {teamSize}
- Average velocity: {velocityAvg} story points
- Recent velocity: {velocityHistory}

Top Prioritized Backlog Items from JIRA:
{backlogItems}

Please provide:
1. A compelling Sprint Goal aligned with business objectives
2. Recommended story point allocation (not exceeding {velocityAvg + 5})
3. Specific backlog items with estimated story points
4. Detailed meeting agenda with time allocations
5. Key discussion topics and decisions required
6. Potential risks and mitigation strategies

Format your response in a structured way for easy use in meetings.
```

### AI Model Configuration
- **Model**: google/gemini-2.5-flash
- **Provider**: Lovable AI Gateway
- **Strengths**: 
  - Balanced performance and speed
  - Good at structured output
  - Handles context well
  - Cost-effective for this use case
- **Alternative**: google/gemini-2.5-pro for more complex scenarios

## Security & Access Control

### Row-Level Security (RLS)
All sprint planning data protected by RLS policies:

```sql
-- View policy
CREATE POLICY "Project members can view sprint planning sessions"
  ON sprint_planning_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = sprint_planning_sessions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Manage policy
CREATE POLICY "Project members can manage sprint planning sessions"
  ON sprint_planning_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = sprint_planning_sessions.project_id
      AND project_members.user_id = auth.uid()
    )
  );
```

### API Token Security
1. **JIRA API Token** (Backend Only):
   - Stored securely in Lovable Cloud
   - Never exposed to frontend
   - Used in edge functions only

2. **Lovable API Key** (Backend Only):
   - Auto-provisioned by Lovable
   - Secure edge function access
   - Rate limits apply

3. **Microsoft Access Token** (User-Specific):
   - OAuth flow initiated from frontend
   - Token stored in localStorage
   - Valid for 1 hour
   - Refresh handled automatically

## Best Practices

### Before Sprint Planning
1. ✅ Ensure JIRA backlog is up-to-date and prioritized
2. ✅ Review previous sprint velocity
3. ✅ Confirm all team members are available
4. ✅ Check that JIRA and Outlook are connected
5. ✅ Verify team distribution list is current

### During Planning
1. ✅ Use AI-generated plan as starting point, not final answer
2. ✅ Allow team discussion and consensus
3. ✅ Adjust estimates based on team input
4. ✅ Consider dependencies and blockers
5. ✅ Verify capacity against commitments

### After Planning
1. ✅ Record detailed meeting notes
2. ✅ Update JIRA with final estimates
3. ✅ Share formatted minutes with team
4. ✅ Create action items for blockers
5. ✅ Review sprint board before starting

## Troubleshooting

### "Failed to fetch backlog"
**Causes**:
- JIRA not connected to workspace
- JIRA API token expired or invalid
- Board ID incorrect
- Network connectivity issue

**Solutions**:
1. Verify workspace has JIRA connected
2. Check JIRA board URL is correct
3. Test JIRA API token in JIRA API console
4. Try reconnecting JIRA integration

### "AI generation failed"
**Causes**:
- Lovable AI rate limits exceeded (429)
- AI usage credits exhausted (402)
- Invalid input data
- Network timeout

**Solutions**:
1. Wait a moment and retry
2. Check Lovable Cloud usage/credits
3. Verify backlog items loaded correctly
4. Ensure velocity data is valid

### "Failed to create Outlook invite"
**Causes**:
- Microsoft access token expired
- Invalid attendee email addresses
- Meeting time in the past
- Insufficient Calendar.ReadWrite permissions

**Solutions**:
1. Reconnect to Outlook
2. Verify all email addresses are valid
3. Check meeting date/time is future
4. Re-authorize with proper permissions

### "JIRA update failed"
**Causes**:
- JIRA API token lacks write permissions
- Issue keys invalid or moved
- Custom field configuration changed
- JIRA site URL incorrect

**Solutions**:
1. Verify API token has project admin rights
2. Check issue keys exist in JIRA
3. Confirm customfield_10016 is story points field
4. Test JIRA connectivity manually

## Performance Considerations

### Response Times
- **Fetch JIRA Backlog**: 2-5 seconds
- **AI Plan Generation**: 10-15 seconds
- **Create Outlook Invite**: 3-7 seconds
- **Record Minutes**: 8-12 seconds

### Optimization Tips
1. Limit backlog fetch to 20 items (configurable)
2. Cache velocity data locally
3. Reuse Microsoft access token (1 hour validity)
4. Batch JIRA updates when possible

### Rate Limits
- **Lovable AI**: Workspace-level limits
- **JIRA API**: 10,000 requests/hour per token
- **Microsoft Graph**: 2,000 requests/minute per app

## Future Enhancements

### Planned Features
- [ ] Historical sprint planning comparison
- [ ] AI-suggested team member assignments
- [ ] Automated dependency graph visualization
- [ ] Risk prediction based on past sprints
- [ ] Integration with sprint retrospective data
- [ ] Multi-language support for international teams
- [ ] Custom AI prompt templates per team
- [ ] Slack notifications for sprint milestones
- [ ] Export to PowerPoint/PDF
- [ ] Voice-to-text meeting notes capture

### Integration Ideas
- **Confluence**: Auto-create sprint wiki pages
- **Azure DevOps**: Alternative to JIRA
- **Slack**: Send agenda and reminders
- **GitHub Projects**: Sync with issue tracking
- **Analytics**: Sprint success predictions

## Support & Resources

### Related Documentation
- [Project Workspace Setup](PROJECT_WORKSPACE_SETUP.md)
- [Ceremony Setup Instructions](CEREMONY_SETUP_INSTRUCTIONS.md)

### External Resources
- [Lovable AI Documentation](https://docs.lovable.dev/features/ai)
- [JIRA Agile API](https://developer.atlassian.com/cloud/jira/software/rest/intro/)
- [Microsoft Graph Calendar API](https://docs.microsoft.com/en-us/graph/api/resources/calendar)
- [Scrum Guide](https://scrumguides.org/)

### Troubleshooting
For issues specific to:
- **AI features**: Check Lovable Cloud usage and credits
- **JIRA integration**: Verify API token and permissions
- **Outlook integration**: Confirm OAuth consent and scopes
- **General errors**: Check browser console and edge function logs

## Notes
- The password security warning is a general Supabase auth setting, not specific to this feature
- Lovable AI usage is metered - check your workspace credits
- Sprint planning sessions are stored permanently for historical reference
- Meeting minutes can be exported from the database
- All times are UTC - consider team time zones when scheduling