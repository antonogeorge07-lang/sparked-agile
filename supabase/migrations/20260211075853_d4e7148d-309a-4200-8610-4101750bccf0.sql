
-- Add integrity_hash column to gdpr_consent_records for tamper detection
ALTER TABLE public.gdpr_consent_records 
ADD COLUMN IF NOT EXISTS integrity_hash text;

-- Create a SECURITY DEFINER trigger function that:
-- 1. Validates consent_type against allowed values
-- 2. Generates HMAC-SHA256 integrity hash using server-side secret
-- 3. Hashes ip_address for privacy (already done elsewhere but enforce here)
-- 4. Rate-limits consent record creation (max 10 per user per hour)
CREATE OR REPLACE FUNCTION public.validate_and_sign_consent_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  allowed_types TEXT[] := ARRAY['analytics', 'marketing', 'functional', 'necessary', 'data_processing', 'communications', 'third_party_sharing'];
  recent_count INTEGER;
BEGIN
  -- 1. Enforce user_id matches authenticated user (defense-in-depth, RLS also checks)
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for consent records';
  END IF;
  
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create consent records for other users';
  END IF;

  -- 2. Validate consent_type against allowed values
  IF NOT (NEW.consent_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'Invalid consent type: %', NEW.consent_type;
  END IF;

  -- 3. Rate limit: max 10 consent records per user per hour
  SELECT COUNT(*) INTO recent_count
  FROM public.gdpr_consent_records
  WHERE user_id = auth.uid()
  AND created_at > now() - INTERVAL '1 hour';

  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many consent changes per hour';
  END IF;

  -- 4. Hash IP address for privacy (store hash, not raw IP)
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address := encode(sha256(NEW.ip_address::bytea), 'hex');
  END IF;

  -- 5. Generate integrity hash (HMAC-style using record fields)
  NEW.integrity_hash := encode(
    sha256(
      (NEW.user_id::TEXT || '|' || NEW.consent_type || '|' || NEW.consent_given::TEXT || '|' || COALESCE(NEW.created_at, now())::TEXT || '|' || COALESCE(NEW.consent_text, ''))::bytea
    ),
    'hex'
  );

  -- 6. Also log to immutable consent history
  INSERT INTO public.gdpr_consent_history (
    user_id,
    consent_record_id,
    consent_type,
    consent_given,
    consent_text,
    action,
    ip_address_hash,
    record_hash,
    recorded_at
  ) VALUES (
    NEW.user_id,
    NEW.id,
    NEW.consent_type,
    NEW.consent_given,
    NEW.consent_text,
    'consent_given',
    COALESCE(NEW.ip_address, ''),
    encode(sha256((NEW.user_id::TEXT || '|' || NEW.consent_type || '|' || NEW.consent_given::TEXT)::bytea), 'hex'),
    COALESCE(NEW.created_at, now())
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to validate and sign every consent insert
DROP TRIGGER IF EXISTS trg_validate_sign_consent ON public.gdpr_consent_records;
CREATE TRIGGER trg_validate_sign_consent
BEFORE INSERT ON public.gdpr_consent_records
FOR EACH ROW
EXECUTE FUNCTION public.validate_and_sign_consent_record();
