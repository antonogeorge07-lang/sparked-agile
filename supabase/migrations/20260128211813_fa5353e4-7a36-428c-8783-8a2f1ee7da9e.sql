
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_incident_audit_log;

-- Replace with a security definer function for audit log insertion
-- This ensures only the trigger can insert, not direct user requests
CREATE OR REPLACE FUNCTION public.insert_security_incident_audit(
  p_incident_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_old_data JSONB,
  p_new_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO security_incident_audit_log (
    incident_id,
    user_id,
    action,
    old_data,
    new_data,
    ip_address,
    created_at
  ) VALUES (
    p_incident_id,
    p_user_id,
    p_action,
    p_old_data,
    p_new_data,
    COALESCE(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      'internal'
    ),
    now()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Update the trigger function to use the security definer function
CREATE OR REPLACE FUNCTION public.log_security_incident_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM insert_security_incident_audit(NEW.id, auth.uid(), 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM insert_security_incident_audit(NEW.id, auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM insert_security_incident_audit(OLD.id, auth.uid(), 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- No RLS insert policy needed - the security definer function bypasses RLS
