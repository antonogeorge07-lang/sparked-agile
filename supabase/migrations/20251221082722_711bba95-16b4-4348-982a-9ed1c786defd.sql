-- Create token_expiry_notifications table
CREATE TABLE IF NOT EXISTS public.token_expiry_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE,
  notification_type TEXT DEFAULT 'warning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_expiry_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
ON public.token_expiry_notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications"
ON public.token_expiry_notifications FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Create function to check for expiring tokens
CREATE OR REPLACE FUNCTION public.get_expiring_tokens(hours_threshold INTEGER DEFAULT 24)
RETURNS TABLE(
  user_id UUID,
  integration_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  hours_until_expiry NUMERIC
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    g.user_id,
    'github'::TEXT as integration_type,
    g.token_expires_at as expires_at,
    EXTRACT(EPOCH FROM (g.token_expires_at - now())) / 3600 as hours_until_expiry
  FROM user_github_tokens g
  WHERE g.token_expires_at IS NOT NULL 
    AND g.token_expires_at <= now() + (hours_threshold || ' hours')::INTERVAL
    AND g.token_expires_at > now()
  UNION ALL
  SELECT 
    j.user_id,
    'jira'::TEXT as integration_type,
    j.token_expires_at as expires_at,
    EXTRACT(EPOCH FROM (j.token_expires_at - now())) / 3600 as hours_until_expiry
  FROM user_jira_tokens j
  WHERE j.token_expires_at IS NOT NULL 
    AND j.token_expires_at <= now() + (hours_threshold || ' hours')::INTERVAL
    AND j.token_expires_at > now()
  UNION ALL
  SELECT 
    m.user_id,
    'microsoft'::TEXT as integration_type,
    m.expires_at as expires_at,
    EXTRACT(EPOCH FROM (m.expires_at - now())) / 3600 as hours_until_expiry
  FROM user_microsoft_tokens m
  WHERE m.expires_at IS NOT NULL 
    AND m.expires_at <= now() + (hours_threshold || ' hours')::INTERVAL
    AND m.expires_at > now();
$$;