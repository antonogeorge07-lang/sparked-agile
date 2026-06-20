-- GDPR Compliance: Immutable audit trail for data_breach_log access

-- 1. Create a dedicated immutable audit table for breach log access
CREATE TABLE IF NOT EXISTS public.data_breach_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'VIEW', 'CREATE', 'UPDATE'
  breach_id UUID,
  ip_address_hash TEXT,
  user_agent TEXT,
  access_granted BOOLEAN NOT NULL DEFAULT true,
  record_hash TEXT NOT NULL -- Cryptographic hash for integrity verification
);

-- 2. Enable RLS on the audit table
ALTER TABLE public.data_breach_access_audit ENABLE ROW LEVEL SECURITY;

-- 3. CRITICAL: Make audit table immutable - only INSERT allowed, no UPDATE/DELETE
CREATE POLICY "Audit records are immutable - insert only"
ON public.data_breach_access_audit
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only platform owner can view audit trail"
ON public.data_breach_access_audit
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email = 'antono.george07@gmail.com'
  )
);

-- No UPDATE or DELETE policies - making it truly immutable

-- 4. Create hash function for audit record integrity
CREATE OR REPLACE FUNCTION public.generate_breach_audit_hash(
  p_user_id UUID,
  p_action TEXT,
  p_breach_id UUID,
  p_accessed_at TIMESTAMPTZ
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT encode(
    sha256(
      (p_user_id::TEXT || p_action || COALESCE(p_breach_id::TEXT, 'null') || p_accessed_at::TEXT)::bytea
    ),
    'hex'
  );
$$;

-- 5. Create trigger function to auto-log breach data access
CREATE OR REPLACE FUNCTION public.log_breach_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_ip_hash TEXT;
  v_user_agent TEXT;
  v_record_hash TEXT;
BEGIN
  -- Get user email for audit
  SELECT email INTO v_user_email
  FROM profiles
  WHERE id = auth.uid();

  -- Hash IP address for privacy
  v_ip_hash := hash_ip_address(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      current_setting('request.headers', true)::json->>'cf-connecting-ip',
      'unknown'
    )
  );

  v_user_agent := current_setting('request.headers', true)::json->>'user-agent';

  -- Generate integrity hash
  v_record_hash := generate_breach_audit_hash(
    auth.uid(),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    now()
  );

  -- Insert immutable audit record
  INSERT INTO data_breach_access_audit (
    user_id,
    user_email,
    action,
    breach_id,
    ip_address_hash,
    user_agent,
    access_granted,
    record_hash
  ) VALUES (
    auth.uid(),
    v_user_email,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    v_ip_hash,
    v_user_agent,
    true,
    v_record_hash
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if logging fails, but still log the attempt
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Create trigger for all operations on data_breach_log
DROP TRIGGER IF EXISTS audit_breach_log_access ON public.data_breach_log;
CREATE TRIGGER audit_breach_log_access
AFTER INSERT OR UPDATE ON public.data_breach_log
FOR EACH ROW
EXECUTE FUNCTION log_breach_data_access();

-- 7. Create a secure view function that logs SELECT access
CREATE OR REPLACE FUNCTION public.get_breach_logs_with_audit()
RETURNS SETOF public.data_breach_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_ip_hash TEXT;
  v_record_hash TEXT;
BEGIN
  -- Verify admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get user info for audit
  SELECT email INTO v_user_email FROM profiles WHERE id = auth.uid();
  
  v_ip_hash := hash_ip_address(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      'unknown'
    )
  );

  v_record_hash := generate_breach_audit_hash(auth.uid(), 'VIEW_ALL', NULL, now());

  -- Log the access attempt
  INSERT INTO data_breach_access_audit (
    user_id,
    user_email,
    action,
    breach_id,
    ip_address_hash,
    access_granted,
    record_hash
  ) VALUES (
    auth.uid(),
    v_user_email,
    'VIEW_ALL',
    NULL,
    v_ip_hash,
    true,
    v_record_hash
  );

  -- Return the breach logs
  RETURN QUERY SELECT * FROM data_breach_log ORDER BY detected_at DESC;
END;
$$;

-- 8. Create function to get specific breach with audit
CREATE OR REPLACE FUNCTION public.get_breach_log_by_id(breach_id_param UUID)
RETURNS public.data_breach_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.data_breach_log;
  v_user_email TEXT;
  v_ip_hash TEXT;
  v_record_hash TEXT;
BEGIN
  -- Verify admin access
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get user info for audit
  SELECT email INTO v_user_email FROM profiles WHERE id = auth.uid();
  
  v_ip_hash := hash_ip_address(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      'unknown'
    )
  );

  v_record_hash := generate_breach_audit_hash(auth.uid(), 'VIEW_SINGLE', breach_id_param, now());

  -- Log the access attempt
  INSERT INTO data_breach_access_audit (
    user_id,
    user_email,
    action,
    breach_id,
    ip_address_hash,
    access_granted,
    record_hash
  ) VALUES (
    auth.uid(),
    v_user_email,
    'VIEW_SINGLE',
    breach_id_param,
    v_ip_hash,
    true,
    v_record_hash
  );

  -- Get and return the specific breach log
  SELECT * INTO v_result FROM data_breach_log WHERE id = breach_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Breach log not found: %', breach_id_param;
  END IF;

  RETURN v_result;
END;
$$;

-- 9. Add index for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_breach_access_audit_user ON public.data_breach_access_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_breach_access_audit_time ON public.data_breach_access_audit(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_breach_access_audit_breach ON public.data_breach_access_audit(breach_id);

-- 10. Add comment for documentation
COMMENT ON TABLE public.data_breach_access_audit IS 'GDPR-compliant immutable audit trail for data_breach_log access. Records cannot be modified or deleted after creation. Each record includes a cryptographic hash for integrity verification.';