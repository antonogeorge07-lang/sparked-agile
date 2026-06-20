-- ============================================================
-- SECURITY HARDENING MIGRATION
-- Addresses all scanner findings for token tables, profiles,
-- GDPR compliance, and sensitive data protection
-- ============================================================

-- ===========================================
-- 1. TOKEN TABLES: Create safe views
-- ===========================================

-- Create safe view for GitHub tokens (no encrypted data exposed)
DROP VIEW IF EXISTS public.user_github_tokens_safe;
CREATE VIEW public.user_github_tokens_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  github_username,
  oauth_provider,
  is_valid,
  last_validated_at,
  token_expires_at,
  validation_error,
  scopes,
  created_at,
  updated_at,
  -- Boolean indicators instead of actual tokens
  (encrypted_token IS NOT NULL OR encrypted_access_token IS NOT NULL) AS has_token,
  (refresh_token_encrypted IS NOT NULL) AS has_refresh_token
FROM public.user_github_tokens
WHERE user_id = auth.uid();

COMMENT ON VIEW public.user_github_tokens_safe IS 
'Safe view exposing GitHub token metadata without encrypted values. Use this view instead of direct table access.';

-- Create safe view for Jira tokens
DROP VIEW IF EXISTS public.user_jira_tokens_safe;
CREATE VIEW public.user_jira_tokens_safe
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  jira_email,
  jira_site_url,
  cloud_id,
  oauth_provider,
  is_valid,
  last_validated_at,
  token_expires_at,
  validation_error,
  scopes,
  created_at,
  updated_at,
  -- Boolean indicators instead of actual tokens
  (encrypted_token IS NOT NULL OR encrypted_access_token IS NOT NULL) AS has_token,
  (refresh_token_encrypted IS NOT NULL OR encrypted_refresh_token IS NOT NULL) AS has_refresh_token
FROM public.user_jira_tokens
WHERE user_id = auth.uid();

COMMENT ON VIEW public.user_jira_tokens_safe IS 
'Safe view exposing Jira token metadata without encrypted values. Use this view instead of direct table access.';

-- ===========================================
-- 2. PROFILES: Create safe teammate view
-- ===========================================

DROP VIEW IF EXISTS public.project_teammates_safe;
CREATE VIEW public.project_teammates_safe
WITH (security_invoker=on) AS
SELECT DISTINCT
  p.id,
  p.full_name,
  p.avatar_url,
  p.role
FROM public.profiles p
WHERE 
  p.id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.project_members pm1
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = p.id
  );

COMMENT ON VIEW public.project_teammates_safe IS 
'Safe view for accessing teammate profiles. Excludes email and other PII.';

-- ===========================================
-- 3. GDPR CONSENT: Enforce immutability
-- ===========================================

DROP POLICY IF EXISTS "No updates to consent records" ON public.gdpr_consent_records;
DROP POLICY IF EXISTS "No deletes to consent records" ON public.gdpr_consent_records;

CREATE POLICY "No updates to consent records"
ON public.gdpr_consent_records
FOR UPDATE
USING (false);

CREATE POLICY "No deletes to consent records"
ON public.gdpr_consent_records
FOR DELETE
USING (false);

-- ===========================================
-- 4. INTEGRATION CACHE: Add payload sanitization trigger
-- ===========================================

CREATE OR REPLACE FUNCTION public.sanitize_integration_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.data IS NOT NULL THEN
    NEW.data = NEW.data - ARRAY[
      'password', 'token', 'secret', 'api_key', 'credentials',
      'access_token', 'refresh_token', 'private_key', 'authorization',
      'client_secret', 'webhook_secret', 'encryption_key'
    ];
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_integration_cache_trigger ON public.integration_cache;
CREATE TRIGGER sanitize_integration_cache_trigger
BEFORE INSERT OR UPDATE ON public.integration_cache
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_integration_cache();

-- ===========================================
-- 5. WEBHOOK DELIVERIES: Add payload sanitization
-- ===========================================

CREATE OR REPLACE FUNCTION public.sanitize_webhook_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payload IS NOT NULL THEN
    NEW.payload = public.sanitize_webhook_payload(NEW.payload);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_webhook_delivery_trigger ON public.webhook_deliveries;
CREATE TRIGGER sanitize_webhook_delivery_trigger
BEFORE INSERT OR UPDATE ON public.webhook_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_webhook_delivery();

-- ===========================================
-- 6. LANDING FEEDBACK: Ensure rate limiting
-- ===========================================

DROP TRIGGER IF EXISTS check_feedback_rate_limit_trigger ON public.landing_feedback;
CREATE TRIGGER check_feedback_rate_limit_trigger
BEFORE INSERT ON public.landing_feedback
FOR EACH ROW
EXECUTE FUNCTION public.check_feedback_rate_limit();

-- ===========================================
-- 7. DATA BREACH LOG: Restrict to security admins only
-- ===========================================

DROP POLICY IF EXISTS "Admins can view breach logs" ON public.data_breach_log;
DROP POLICY IF EXISTS "Admin access to breach logs" ON public.data_breach_log;
DROP POLICY IF EXISTS "Only security admins can view breach logs" ON public.data_breach_log;

CREATE POLICY "Only security admins can view breach logs"
ON public.data_breach_log
FOR SELECT
USING (is_security_admin(auth.uid()));

DROP POLICY IF EXISTS "No updates to breach logs" ON public.data_breach_log;
CREATE POLICY "No updates to breach logs"
ON public.data_breach_log
FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "No deletes to breach logs" ON public.data_breach_log;
CREATE POLICY "No deletes to breach logs"
ON public.data_breach_log
FOR DELETE
USING (false);

DROP POLICY IF EXISTS "Security admins can insert breach logs" ON public.data_breach_log;
CREATE POLICY "Security admins can insert breach logs"
ON public.data_breach_log
FOR INSERT
WITH CHECK (is_security_admin(auth.uid()));

-- ===========================================
-- 8. SECURITY INCIDENTS: Consolidate policies
-- ===========================================

DROP POLICY IF EXISTS "Admins can view all security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can manage incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Only admins can manage security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can view incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can create incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Security admins can update incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "No deletion of security incidents" ON public.security_incidents;

CREATE POLICY "Security admins can view incidents"
ON public.security_incidents
FOR SELECT
USING (is_security_admin(auth.uid()));

CREATE POLICY "Security admins can create incidents"
ON public.security_incidents
FOR INSERT
WITH CHECK (is_security_admin(auth.uid()));

CREATE POLICY "Security admins can update incidents"
ON public.security_incidents
FOR UPDATE
USING (is_security_admin(auth.uid()));

CREATE POLICY "No deletion of security incidents"
ON public.security_incidents
FOR DELETE
USING (false);

-- ===========================================
-- 9. PROJECT MEMBERS: Restrict roster visibility
-- ===========================================

DROP POLICY IF EXISTS "Members can see project leadership" ON public.project_members;

CREATE POLICY "Project members can see leadership"
ON public.project_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    role IN ('owner', 'admin')
    AND is_project_member(project_id, auth.uid())
  )
);

-- ===========================================
-- 10. SURVEY RESPONSES: Add anonymity column
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'survey_responses' 
    AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE public.survey_responses ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ===========================================
-- Documentation comments
-- ===========================================

COMMENT ON TABLE public.gdpr_consent_records IS 
'GDPR consent records are IMMUTABLE. Updates and deletes prohibited.';

COMMENT ON TABLE public.chat_messages IS 
'User chat messages - private per user.';

COMMENT ON TABLE public.user_activity_logs IS 
'Activity tracking with 90-day retention policy.';