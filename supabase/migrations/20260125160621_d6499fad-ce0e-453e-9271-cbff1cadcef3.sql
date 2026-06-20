-- GDPR Compliant Immutable Consent Records
-- Implements: Immutable logging, consent history, fraud prevention

-- 1. Create consent history table for audit trail
CREATE TABLE IF NOT EXISTS public.gdpr_consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_record_id UUID NOT NULL,
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('granted', 'withdrawn', 'modified')),
  previous_value BOOLEAN,
  consent_text TEXT,
  ip_address_hash TEXT, -- Store hashed IP for privacy
  user_agent TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Immutability marker - records cannot be modified after creation
  record_hash TEXT NOT NULL
);

-- 2. Enable RLS on history table
ALTER TABLE public.gdpr_consent_history ENABLE ROW LEVEL SECURITY;

-- 3. Create index for efficient lookups
CREATE INDEX idx_gdpr_consent_history_user ON public.gdpr_consent_history(user_id);
CREATE INDEX idx_gdpr_consent_history_record ON public.gdpr_consent_history(consent_record_id);
CREATE INDEX idx_gdpr_consent_history_recorded ON public.gdpr_consent_history(recorded_at);

-- 4. RLS policies for history - READ ONLY for users, no modifications
CREATE POLICY "Users can view own consent history"
  ON public.gdpr_consent_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for regular users - only system can insert

-- 5. Drop the UPDATE policy on main consent table (make it immutable)
DROP POLICY IF EXISTS "Users can withdraw consent" ON public.gdpr_consent_records;

-- 6. Create function to generate record hash for integrity verification
CREATE OR REPLACE FUNCTION public.generate_consent_hash(
  p_user_id UUID,
  p_consent_type TEXT,
  p_consent_given BOOLEAN,
  p_recorded_at TIMESTAMPTZ
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT encode(
    sha256(
      (p_user_id::TEXT || p_consent_type || p_consent_given::TEXT || p_recorded_at::TEXT)::bytea
    ),
    'hex'
  );
$$;

-- 7. Create SECURITY DEFINER function to record consent changes (immutable insert-only)
CREATE OR REPLACE FUNCTION public.record_consent_change(
  p_consent_type TEXT,
  p_consent_given BOOLEAN,
  p_consent_text TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_record_id UUID;
  v_previous_value BOOLEAN;
  v_action TEXT;
  v_recorded_at TIMESTAMPTZ;
  v_record_hash TEXT;
  v_ip_hash TEXT;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_recorded_at := now();
  
  -- Hash IP address for privacy
  v_ip_hash := CASE 
    WHEN p_ip_address IS NOT NULL THEN encode(sha256(p_ip_address::bytea), 'hex')
    ELSE NULL
  END;

  -- Check for existing consent record
  SELECT id, consent_given INTO v_existing_record_id, v_previous_value
  FROM gdpr_consent_records
  WHERE user_id = v_user_id AND consent_type = p_consent_type
  ORDER BY created_at DESC
  LIMIT 1;

  -- Determine action type
  IF v_existing_record_id IS NULL THEN
    v_action := 'granted';
  ELSIF v_previous_value = true AND p_consent_given = false THEN
    v_action := 'withdrawn';
  ELSIF v_previous_value = false AND p_consent_given = true THEN
    v_action := 'granted';
  ELSE
    v_action := 'modified';
  END IF;

  -- Generate integrity hash
  v_record_hash := generate_consent_hash(v_user_id, p_consent_type, p_consent_given, v_recorded_at);

  -- Insert new consent record (never update existing)
  INSERT INTO gdpr_consent_records (
    user_id,
    consent_type,
    consent_given,
    consent_text,
    ip_address,
    user_agent,
    created_at,
    withdrawn_at
  )
  VALUES (
    v_user_id,
    p_consent_type,
    p_consent_given,
    p_consent_text,
    v_ip_hash, -- Store hashed IP
    p_user_agent,
    v_recorded_at,
    CASE WHEN p_consent_given = false THEN v_recorded_at ELSE NULL END
  )
  RETURNING id INTO v_existing_record_id;

  -- Record in immutable history
  INSERT INTO gdpr_consent_history (
    consent_record_id,
    user_id,
    consent_type,
    consent_given,
    action,
    previous_value,
    consent_text,
    ip_address_hash,
    user_agent,
    recorded_at,
    record_hash
  )
  VALUES (
    v_existing_record_id,
    v_user_id,
    p_consent_type,
    p_consent_given,
    v_action,
    v_previous_value,
    p_consent_text,
    v_ip_hash,
    p_user_agent,
    v_recorded_at,
    v_record_hash
  );

  -- Log the consent change for audit
  INSERT INTO sensitive_data_access_log (
    user_id,
    table_accessed,
    access_type,
    query_context
  )
  VALUES (
    v_user_id,
    'gdpr_consent_records',
    'CONSENT_' || UPPER(v_action),
    format('Consent %s: %s = %s', v_action, p_consent_type, p_consent_given)
  );

  RETURN v_existing_record_id;
END;
$$;

-- 8. Create function to get consent status (latest for each type)
CREATE OR REPLACE FUNCTION public.get_my_consent_status()
RETURNS TABLE (
  consent_type TEXT,
  consent_given BOOLEAN,
  granted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  history_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  WITH latest_consent AS (
    SELECT DISTINCT ON (gcr.consent_type)
      gcr.consent_type,
      gcr.consent_given,
      gcr.created_at as granted_at,
      gcr.withdrawn_at
    FROM gdpr_consent_records gcr
    WHERE gcr.user_id = auth.uid()
    ORDER BY gcr.consent_type, gcr.created_at DESC
  )
  SELECT 
    lc.consent_type,
    lc.consent_given,
    lc.granted_at,
    lc.withdrawn_at,
    (SELECT COUNT(*) FROM gdpr_consent_history gch 
     WHERE gch.user_id = auth.uid() AND gch.consent_type = lc.consent_type) as history_count
  FROM latest_consent lc;
END;
$$;

-- 9. Create function to verify consent record integrity
CREATE OR REPLACE FUNCTION public.verify_consent_integrity(p_history_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record RECORD;
  v_computed_hash TEXT;
BEGIN
  SELECT * INTO v_record
  FROM gdpr_consent_history
  WHERE id = p_history_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  v_computed_hash := generate_consent_hash(
    v_record.user_id,
    v_record.consent_type,
    v_record.consent_given,
    v_record.recorded_at
  );

  RETURN v_computed_hash = v_record.record_hash;
END;
$$;

-- 10. Add comment explaining immutability
COMMENT ON TABLE public.gdpr_consent_history IS 
  'Immutable audit log for GDPR consent changes. Records cannot be modified or deleted. Each entry has a cryptographic hash for integrity verification.';

COMMENT ON FUNCTION public.record_consent_change IS
  'GDPR-compliant function to record consent changes. Creates new records instead of updating (immutable). Hashes IP addresses for privacy. Logs all changes to audit trail.';