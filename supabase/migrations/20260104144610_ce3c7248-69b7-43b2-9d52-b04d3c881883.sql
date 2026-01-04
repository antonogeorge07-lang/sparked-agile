-- Add audit logging for security_incidents table to track all access
CREATE TABLE IF NOT EXISTS public.security_incident_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES public.security_incidents(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_incident_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view security audit logs"
  ON public.security_incident_audit_log
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_security_incident_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_incident_audit_log (incident_id, user_id, action, new_data)
    VALUES (NEW.id, auth.uid(), 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_incident_audit_log (incident_id, user_id, action, old_data, new_data)
    VALUES (NEW.id, auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_incident_audit_log (incident_id, user_id, action, old_data)
    VALUES (OLD.id, auth.uid(), 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for security incidents
DROP TRIGGER IF EXISTS security_incidents_audit_trigger ON public.security_incidents;
CREATE TRIGGER security_incidents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.security_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_incident_changes();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_security_incident_audit_created_at 
  ON public.security_incident_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_incident_audit_incident_id 
  ON public.security_incident_audit_log(incident_id);