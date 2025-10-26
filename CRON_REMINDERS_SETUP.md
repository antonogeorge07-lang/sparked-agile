# Automated Ceremony Reminders Setup

This document explains how to set up automated scheduled reminders for ceremonies.

## Overview

The system includes:
1. **Manual "Send Reminder" button** - Available in the Dashboard to send immediate reminders to all team members
2. **Scheduled reminders table** - `ceremony_reminders` table to store scheduled reminders
3. **Automated processing** - Edge function that processes pending reminders and sends emails

## Setting Up Automated Reminders

### Step 1: Enable Required Extensions

You need to enable `pg_cron` and `pg_net` extensions in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **Database** > **Extensions**
3. Search for and enable:
   - `pg_cron` - For scheduled jobs
   - `pg_net` - For HTTP requests

### Step 2: Create the Cron Job

Run this SQL in your Supabase SQL Editor:

```sql
-- Schedule the send-scheduled-reminder function to run every 5 minutes
SELECT cron.schedule(
  'send-ceremony-reminders',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
      url:='https://pbrrfxgcksptloiwshiy.supabase.co/functions/v1/send-scheduled-reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicnJmeGdja3NwdGxvaXdzaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDI0NjIsImV4cCI6MjA3NTQ3ODQ2Mn0.Mr_-7jtsTVxjy6vfByYj6rOTqOYphSm3XnoBSydNalo"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
```

### Step 3: Verify the Cron Job

To check if the cron job is set up correctly:

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;

-- View cron job execution history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## How to Use

### Creating Scheduled Reminders

Insert reminders into the `ceremony_reminders` table:

```sql
INSERT INTO public.ceremony_reminders (
  project_id,
  ceremony_type,
  scheduled_time,
  reminder_message
) VALUES (
  'your-project-id-here',
  'standup', -- or 'retrospective', 'sprint_planning', 'sprint_review', 'backlog_refinement'
  '2025-02-01 09:00:00+00', -- Schedule time in UTC
  'Don''t forget to prepare your updates!' -- Optional custom message
);
```

### Manual Reminders

Click the "Send Reminder" button in the Dashboard to immediately send reminders to all team members.

## Ceremony Types

- `standup` - Daily Standup (🗣️)
- `retrospective` - Sprint Retrospective (🔄)
- `sprint_planning` - Sprint Planning (📋)
- `sprint_review` - Sprint Review (🎯)
- `backlog_refinement` - Backlog Refinement (🔍)

## Email Templates

Each ceremony type has a custom email template with:
- Beautiful HTML formatting
- Ceremony-specific emoji and title
- Project name and details
- Optional custom message
- Professional branding

## Troubleshooting

### Cron Job Not Running

1. Check if extensions are enabled:
```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```

2. Check cron job errors:
```sql
SELECT * FROM cron.job_run_details WHERE status = 'failed' ORDER BY start_time DESC;
```

### Reminders Not Sending

1. Check edge function logs in Supabase Dashboard
2. Verify RESEND_API_KEY is configured
3. Check that team members have valid email addresses
4. Verify the scheduled_time is in the past and status is 'pending'

### To Unschedule the Cron Job

```sql
SELECT cron.unschedule('send-ceremony-reminders');
```

## Architecture

```
┌─────────────────┐
│   Dashboard     │
│  Send Button    │
└────────┬────────┘
         │ Manual trigger
         ▼
┌─────────────────────────┐
│ send-bulk-reminder      │
│ Edge Function           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Resend Email API       │
│  (sends to all members) │
└─────────────────────────┘

┌─────────────────────────┐
│  Cron Job (every 5 min) │
└────────┬────────────────┘
         │ Scheduled trigger
         ▼
┌─────────────────────────┐
│ send-scheduled-reminder │
│ Edge Function           │
└────────┬────────────────┘
         │
         ├─► Query ceremony_reminders table
         │   (pending & due reminders)
         │
         ├─► Send emails via Resend API
         │
         └─► Update reminder status
```

## Security

- RLS policies ensure users can only create/view reminders for their allocated projects
- Edge functions validate user authentication
- Email API keys are stored securely as environment variables
- Service role is used for cron job access only

## Cost Considerations

- **Cron jobs**: Free on Supabase (runs every 5 minutes)
- **Edge function invocations**: Free tier includes 500K requests/month
- **Email sending**: Depends on your Resend plan (100 emails/day on free tier)
