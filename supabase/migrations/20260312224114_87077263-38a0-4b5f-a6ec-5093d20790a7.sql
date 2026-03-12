
-- Persistent rate limiting table for chat endpoints
CREATE TABLE public.chat_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_chat_rate_limits_client_window 
ON public.chat_rate_limits (client_identifier, window_start);

-- Auto-cleanup: delete entries older than 24 hours
CREATE INDEX idx_chat_rate_limits_cleanup 
ON public.chat_rate_limits (window_start);

-- No RLS needed - this table is only accessed by edge functions via service role
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit(
  p_client_id text,
  p_max_requests integer,
  p_window_seconds integer DEFAULT 60
)
RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  -- Get current count in window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM chat_rate_limits
  WHERE client_identifier = p_client_id
  AND window_start >= v_window_start;
  
  IF v_current_count >= p_max_requests THEN
    RETURN QUERY SELECT false, 0, v_window_start + (p_window_seconds || ' seconds')::interval;
    RETURN;
  END IF;
  
  -- Upsert the rate limit entry
  INSERT INTO chat_rate_limits (client_identifier, request_count, window_start)
  VALUES (p_client_id, 1, date_trunc('minute', now()))
  ON CONFLICT (id) DO NOTHING;
  
  -- Use a simpler approach: just insert a new row per request
  INSERT INTO chat_rate_limits (client_identifier, request_count, window_start)
  VALUES (p_client_id, 1, now());
  
  RETURN QUERY SELECT true, p_max_requests - v_current_count - 1, now() + (p_window_seconds || ' seconds')::interval;
END;
$$;

-- Cleanup function for old rate limit entries (called by scheduled-cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_chat_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM chat_rate_limits
  WHERE window_start < now() - interval '1 hour'
  RETURNING 1 INTO deleted_count;
  
  RETURN COALESCE(deleted_count, 0);
END;
$$;
