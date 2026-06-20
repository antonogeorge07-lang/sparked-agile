# Outlook Ceremony Setup - Implementation Guide

## Overview
This feature allows one-click scheduling of Agile ceremonies (Daily Standups, Sprint Planning, Retrospectives, PI Planning) directly to Microsoft Outlook calendars using Microsoft Graph API.

## Setup Steps

### Step 1: Azure Portal Setup (Required)
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Configure your app:
   - **Name**: "SM ActiveIntelligence - Ceremony Setup"
   - **Supported account types**: Accounts in any organizational directory (Any Azure AD directory - Multitenant)
   - **Redirect URI**: 
     - Platform: Web
     - URI: `https://your-domain.com/ceremony-setup` (or `http://localhost:5173/ceremony-setup` for local testing)
4. Click **Register**

### Step 2: Configure API Permissions
1. In your app, go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `Calendars.ReadWrite` - Create and manage calendar events
   - `offline_access` - Maintain access to data
4. Click **Grant admin consent** (if you're an admin)

### Step 3: Create Client Secret
1. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
2. Description: "Ceremony Setup Secret"
3. Expires: Choose appropriate duration (12 or 24 months recommended)
4. Click **Add**
5. **IMPORTANT**: Copy the secret value immediately (you won't be able to see it again)

### Step 4: Get Your Credentials
You should now have:
- **Application (client) ID**: Found on the Overview page
- **Directory (tenant) ID**: Found on the Overview page
- **Client secret value**: From the previous step

### Step 5: Configure Lovable Cloud (Already Done ✓)
The following secrets have been added to your Lovable Cloud project:
- ✓ `MICROSOFT_CLIENT_ID` - Your Application (client) ID
- ✓ `MICROSOFT_CLIENT_SECRET` - Your client secret value
- ✓ `MICROSOFT_TENANT_ID` - Your Directory (tenant) ID

### Step 6: Update the Frontend Code
In `src/pages/CeremonySetup.tsx`, line 48, replace:
```typescript
const clientId = "YOUR_MICROSOFT_CLIENT_ID";
```
with:
```typescript
const clientId = "YOUR_ACTUAL_CLIENT_ID_HERE";
```

**Note**: This is a public client ID, so it's safe to include in the frontend code.

## How to Use the Feature

### For End Users:

1. **Navigate to Ceremony Setup**
   - Click on "Ceremonies" in the navigation bar
   - Or go directly to `/ceremony-setup`

2. **Connect to Outlook**
   - Click the "Connect Outlook" button
   - You'll be redirected to Microsoft login
   - Sign in with your Microsoft account
   - Grant permissions for calendar access
   - You'll be redirected back to the app

3. **Schedule a Ceremony**
   - Select a ceremony template:
     - **Daily Standup**: 15 minutes, recurring daily
     - **Sprint Planning**: 2 hours, recurring bi-weekly
     - **Sprint Retrospective**: 90 minutes, recurring bi-weekly
     - **PI Planning**: Full day, one-time event
   
   - Configure details:
     - **Start Date**: When the ceremony should begin
     - **Attendees**: Comma-separated email addresses of team members
   
   - Click "Create Ceremony"

4. **Check Your Calendar**
   - Open Microsoft Outlook (web or desktop)
   - Your ceremony should now appear with:
     - Correct date and time
     - All invited attendees
     - Recurring pattern (if applicable)
     - Description of the ceremony

## Features

### Pre-configured Templates
- **Daily Standup**: 15-minute daily sync at 9:00 AM
- **Sprint Planning**: 2-hour session at 10:00 AM, every 2 weeks
- **Sprint Retrospective**: 90-minute session at 2:00 PM, every 2 weeks
- **PI Planning**: Full-day session at 9:00 AM, one-time

### Automatic Recurrence
- Daily ceremonies repeat every business day
- Bi-weekly ceremonies repeat every 2 weeks on the same day
- One-time events are scheduled once

### Team Invitations
- Add multiple attendees via comma-separated emails
- All attendees receive Outlook meeting invitations
- Attendees can accept/decline directly in Outlook

## Technical Architecture

### Components
1. **Edge Functions**:
   - `create-outlook-event`: Creates calendar events via Microsoft Graph API
   - `get-microsoft-token`: Exchanges OAuth code for access token

2. **Frontend**:
   - `src/pages/CeremonySetup.tsx`: Main UI for ceremony setup
   - OAuth flow handling with Microsoft
   - Token storage in localStorage

3. **Security**:
   - All API calls go through secure edge functions
   - Client secrets never exposed to frontend
   - Access tokens stored locally and used for API calls

### Microsoft Graph API Endpoints Used
- **Token Exchange**: `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token`
- **Create Event**: `https://graph.microsoft.com/v1.0/me/events`

## Troubleshooting

### "Connection Failed" Error
- Verify your Client ID in the frontend code
- Check that redirect URI matches in Azure Portal
- Ensure API permissions are granted

### "Failed to Create Event" Error
- Verify access token is valid
- Check that attendee email addresses are valid
- Ensure date format is correct (YYYY-MM-DD)

### "Missing credentials" Error
- Verify all three secrets are set in Lovable Cloud
- Check secret names match exactly (case-sensitive)

## Security Considerations

1. **Client ID**: Public, safe to include in frontend
2. **Client Secret**: Private, only stored in Lovable Cloud
3. **Access Tokens**: Stored in browser localStorage, valid for 1 hour
4. **Refresh Tokens**: Can be implemented for longer sessions

## Future Enhancements
- Add more ceremony types (Backlog Refinement, Release Planning)
- Custom ceremony templates
- Integration with project data for automatic attendee lists
- Calendar sync to show existing ceremonies
- Timezone support for distributed teams

## Support
For issues or questions, check:
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/api/user-post-events)
- [Azure AD OAuth 2.0 Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
