
-- =========================================================
-- 1. Generic SHA-256 hashing trigger for ip_address columns
-- =========================================================
CREATE OR REPLACE FUNCTION public.hash_ip_address_trg()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ip_address IS NOT NULL
     AND NEW.ip_address !~ '^[0-9a-f]{64}$' THEN
    NEW.ip_address := encode(sha256(NEW.ip_address::bytea), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger and backfill for each affected table
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'gdpr_consent_records',
    'project_member_access_log',
    'security_incident_audit_log',
    'sensitive_data_access_log',
    'slack_webhook_audit',
    'token_access_audit'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_hash_ip ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_hash_ip BEFORE INSERT OR UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.hash_ip_address_trg()', t
    );
    EXECUTE format(
      'UPDATE public.%I
         SET ip_address = encode(sha256(ip_address::bytea), ''hex'')
       WHERE ip_address IS NOT NULL
         AND ip_address !~ ''^[0-9a-f]{64}$''', t
    );
    EXECUTE format(
      'COMMENT ON COLUMN public.%I.ip_address IS
        ''SHA-256 hex hash of the client IP. Plaintext IPs are never stored; values are hashed by trg_hash_ip.''', t
    );
  END LOOP;
END $$;

-- =========================================================
-- 2. Hash user_email in data_breach_access_audit
-- =========================================================
CREATE OR REPLACE FUNCTION public.hash_user_email_trg()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_email IS NOT NULL
     AND NEW.user_email !~ '^[0-9a-f]{64}$' THEN
    NEW.user_email := encode(sha256(lower(trim(NEW.user_email))::bytea), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hash_user_email ON public.data_breach_access_audit;
CREATE TRIGGER trg_hash_user_email
  BEFORE INSERT OR UPDATE ON public.data_breach_access_audit
  FOR EACH ROW EXECUTE FUNCTION public.hash_user_email_trg();

UPDATE public.data_breach_access_audit
SET user_email = encode(sha256(lower(trim(user_email))::bytea), 'hex')
WHERE user_email IS NOT NULL
  AND user_email !~ '^[0-9a-f]{64}$';

COMMENT ON COLUMN public.data_breach_access_audit.user_email IS
  'SHA-256 hex hash of the actor email (lowercased, trimmed). Plaintext emails are never stored; hashed by trg_hash_user_email.';

-- =========================================================
-- 3. Protect webhooks.secret from client reads
-- =========================================================
REVOKE SELECT (secret) ON public.webhooks FROM authenticated;
REVOKE SELECT (secret) ON public.webhooks FROM anon;
-- service_role retains full access via GRANT ALL
COMMENT ON COLUMN public.webhooks.secret IS
  'Outbound webhook signing secret. Readable only by service_role (edge functions). Client-facing reads of this column are revoked.';

-- =========================================================
-- 4. Defensive RESTRICTIVE policy on landing_feedback
--    Confirms admin-only read design; blocks any future
--    permissive SELECT policy from leaking PII.
-- =========================================================
DROP POLICY IF EXISTS "landing_feedback_admin_only_select" ON public.landing_feedback;
CREATE POLICY "landing_feedback_admin_only_select"
ON public.landing_feedback
AS RESTRICTIVE
FOR SELECT
TO authenticated, anon
USING (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.landing_feedback IS
  'Anonymous landing-page feedback. INSERT is intentionally unauthenticated (no user_id binding). SELECT is restricted to admins via a RESTRICTIVE policy so that any future permissive policy cannot leak submitter PII.';
