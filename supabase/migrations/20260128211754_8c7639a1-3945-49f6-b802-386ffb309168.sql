
-- Add index on audit log for efficient queries
CREATE INDEX IF NOT EXISTS idx_security_incident_audit_log_incident_id 
  ON public.security_incident_audit_log(incident_id);

CREATE INDEX IF NOT EXISTS idx_security_incident_audit_log_user_id 
  ON public.security_incident_audit_log(user_id);

CREATE INDEX IF NOT EXISTS idx_security_incident_audit_log_created_at 
  ON public.security_incident_audit_log(created_at DESC);

-- Ensure audit log table has proper RLS (only security admins can view)
ALTER TABLE public.security_incident_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Security admins can view audit logs" ON public.security_incident_audit_log;

-- Only platform owner and security admins can view audit logs
CREATE POLICY "Security admins can view audit logs"
  ON public.security_incident_audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_security_admin(auth.uid()));

-- Prevent any modifications to audit logs (immutable)
DROP POLICY IF EXISTS "No modifications to audit logs" ON public.security_incident_audit_log;

CREATE POLICY "No modifications to audit logs"
  ON public.security_incident_audit_log
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Allow system/trigger to insert audit logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_incident_audit_log;

CREATE POLICY "System can insert audit logs"
  ON public.security_incident_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment explaining the security model
COMMENT ON TABLE public.security_incident_audit_log IS 
  'Immutable audit log for all security incident operations. Only security admins (platform owner + admins) can view. Modifications are blocked by RLS.';
