-- Enable required extensions for scheduled reminders
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job to check and send scheduled reminders every 5 minutes
SELECT cron.schedule(
  'send-scheduled-ceremony-reminders',
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