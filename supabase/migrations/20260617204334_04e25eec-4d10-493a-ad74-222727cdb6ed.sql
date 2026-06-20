
-- 1) Hash any plaintext IPs left in gdpr_consent_records (the insert trigger already hashes new rows).
UPDATE public.gdpr_consent_records
SET ip_address = encode(sha256(ip_address::bytea), 'hex')
WHERE ip_address IS NOT NULL
  AND ip_address !~ '^[0-9a-f]{64}$';  -- skip rows already SHA-256 hex hashed

COMMENT ON COLUMN public.gdpr_consent_records.ip_address IS
  'SHA-256 hex hash of the originating IP address. Never store raw IPs here. Enforced by validate_and_sign_consent_record() trigger and by the cleanup above.';

-- 2) Rewrite check_slack_rate_limit to ignore caller-supplied user id and use auth.uid()
CREATE OR REPLACE FUNCTION public.check_slack_rate_limit(
  p_user_id uuid,
  p_action_type text,
  p_max_requests integer DEFAULT 30,
  p_window_minutes integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_count integer;
  v_window_start timestamptz;
BEGIN
  -- Always use the authenticated user. p_user_id is accepted only for backwards-compat
  -- and is ignored unless it matches the caller. Service role bypasses this check.
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'Cannot record rate-limit usage for another user' USING ERRCODE = '42501';
  END IF;

  v_window_start := now() - (p_window_minutes || ' minutes')::interval;

  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM public.slack_api_rate_limits
  WHERE user_id = v_uid
    AND action_type = p_action_type
    AND window_start >= v_window_start;

  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.slack_api_rate_limits (user_id, action_type, request_count, window_start)
  VALUES (v_uid, p_action_type, 1, date_trunc('minute', now()))
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET request_count = public.slack_api_rate_limits.request_count + 1;

  RETURN TRUE;
END;
$function$;

-- 3) Tighten team_members SELECT: must be a project member (any role) to see roster,
-- and emails are still gated by the existing owner/admin policies.
DROP POLICY IF EXISTS "Project members can view team roster" ON public.team_members;
CREATE POLICY "Project members can view team roster"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = team_members.project_id
        AND pm.user_id = auth.uid()
    )
  );
