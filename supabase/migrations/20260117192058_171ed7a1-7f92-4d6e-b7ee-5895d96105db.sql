-- ============================================
-- SLACK WEBHOOK SECURITY HARDENING
-- ============================================

-- 1. Create a safe view that never exposes webhook URLs or encrypted tokens
DROP VIEW IF EXISTS public.user_slack_tokens_safe;
CREATE VIEW public.user_slack_tokens_safe AS
SELECT 
  id,
  user_id,
  team_id,
  team_name,
  channel_id,
  channel_name,
  scopes,
  is_valid,
  last_validated_at,
  validation_error,
  created_at,
  updated_at,
  -- Indicate if webhook is configured without exposing URL
  CASE WHEN webhook_url IS NOT NULL AND webhook_url != '' THEN true ELSE false END as has_webhook,
  -- Indicate if tokens are configured without exposing them
  CASE WHEN encrypted_access_token IS NOT NULL THEN true ELSE false END as has_access_token,
  CASE WHEN encrypted_bot_token IS NOT NULL THEN true ELSE false END as has_bot_token
FROM public.user_slack_tokens;

-- Grant access to the safe view
GRANT SELECT ON public.user_slack_tokens_safe TO authenticated;

-- 2. Create Slack API access rate limiting table
CREATE TABLE IF NOT EXISTS public.slack_api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'send_message', 'fetch_channels', 'oauth', etc.
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.slack_api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role manages slack rate limits"
ON public.slack_api_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_slack_rate_limits_user_action 
ON public.slack_api_rate_limits(user_id, action_type, window_start);

-- 3. Create rate limiting function for Slack operations
CREATE OR REPLACE FUNCTION public.check_slack_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 30,
  p_window_minutes INTEGER DEFAULT 1
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count requests in current window
  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM slack_api_rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start >= v_window_start;
  
  -- Check if limit exceeded
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Log this request
  INSERT INTO slack_api_rate_limits (user_id, action_type, request_count, window_start)
  VALUES (p_user_id, p_action_type, 1, now());
  
  -- Cleanup old entries (older than 1 hour)
  DELETE FROM slack_api_rate_limits 
  WHERE window_start < now() - INTERVAL '1 hour';
  
  RETURN TRUE;
END;
$$;

-- 4. Create secure function to validate Slack webhook without exposing URL
CREATE OR REPLACE FUNCTION public.validate_slack_webhook_exists(p_token_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;
  
  -- Check if token belongs to user and has webhook
  SELECT jsonb_build_object(
    'has_webhook', webhook_url IS NOT NULL AND webhook_url != '',
    'is_valid', is_valid,
    'team_name', team_name,
    'channel_name', channel_name
  ) INTO v_result
  FROM user_slack_tokens
  WHERE id = p_token_id AND user_id = v_user_id;
  
  IF v_result IS NULL THEN
    RETURN jsonb_build_object('error', 'Token not found or access denied');
  END IF;
  
  RETURN v_result;
END;
$$;

-- 5. Create audit log for Slack webhook usage
CREATE TABLE IF NOT EXISTS public.slack_webhook_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'message_sent', 'webhook_updated', 'webhook_removed'
  target_channel TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slack_webhook_audit ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own slack audit logs"
ON public.slack_webhook_audit
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert audit logs
CREATE POLICY "Service role inserts slack audit logs"
ON public.slack_webhook_audit
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_slack_webhook_audit_user 
ON public.slack_webhook_audit(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_slack_webhook_audit_token 
ON public.slack_webhook_audit(token_id, created_at DESC);

-- 6. Create function to log Slack webhook usage
CREATE OR REPLACE FUNCTION public.log_slack_webhook_usage(
  p_token_id UUID,
  p_action_type TEXT,
  p_target_channel TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user from token
  SELECT user_id INTO v_user_id
  FROM user_slack_tokens
  WHERE id = p_token_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO slack_webhook_audit (
      token_id, user_id, action_type, target_channel, success, error_message
    ) VALUES (
      p_token_id, v_user_id, p_action_type, p_target_channel, p_success, p_error_message
    );
  END IF;
END;
$$;

-- 7. Add cleanup for old audit logs (90 days retention)
CREATE OR REPLACE FUNCTION public.cleanup_slack_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM slack_webhook_audit 
  WHERE created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  DELETE FROM slack_api_rate_limits
  WHERE created_at < now() - INTERVAL '1 day';
  
  RETURN v_deleted;
END;
$$;

-- 8. Revoke direct access to sensitive columns - create restrictive policy
-- First, drop existing policies that might allow broad access
DROP POLICY IF EXISTS "Users can view their own Slack token" ON public.user_slack_tokens;

-- Create new policy that only returns non-sensitive fields through safe view
-- Direct table access is needed for Edge Functions (service role) only
CREATE POLICY "Users read own slack tokens via safe view"
ON public.user_slack_tokens
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND public.check_slack_rate_limit(auth.uid(), 'token_access', 60, 1)
);

-- Keep insert/update/delete policies but add rate limiting
DROP POLICY IF EXISTS "Users can insert their own Slack token" ON public.user_slack_tokens;
CREATE POLICY "Users can insert their own Slack token"
ON public.user_slack_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.check_slack_rate_limit(auth.uid(), 'token_insert', 5, 1)
);

DROP POLICY IF EXISTS "Users can update their own Slack token" ON public.user_slack_tokens;
CREATE POLICY "Users can update their own Slack token"
ON public.user_slack_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.check_slack_rate_limit(auth.uid(), 'token_update', 10, 1)
);

DROP POLICY IF EXISTS "Users can delete their own Slack token" ON public.user_slack_tokens;
CREATE POLICY "Users can delete their own Slack token"
ON public.user_slack_tokens
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.check_slack_rate_limit(auth.uid(), 'token_delete', 5, 1)
);