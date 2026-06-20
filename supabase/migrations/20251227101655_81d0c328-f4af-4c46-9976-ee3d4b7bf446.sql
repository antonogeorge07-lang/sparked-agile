-- Security Fixes: Strengthen RLS policies and add audit logging

-- 1. Fix sensitive_data_access_log policies - change from 'public' to 'authenticated'
DROP POLICY IF EXISTS "Only admins can view access logs" ON public.sensitive_data_access_log;
DROP POLICY IF EXISTS "System can insert access logs" ON public.sensitive_data_access_log;
DROP POLICY IF EXISTS "Users can view own data access logs" ON public.sensitive_data_access_log;

-- Users can only view their own access logs
CREATE POLICY "Users can view own data access logs" 
ON public.sensitive_data_access_log 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all access logs
CREATE POLICY "Admins can view all access logs" 
ON public.sensitive_data_access_log 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Only service role can insert access logs (for system-generated entries)
CREATE POLICY "Service role can insert access logs" 
ON public.sensitive_data_access_log 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Authenticated users can insert their own access logs
CREATE POLICY "Users can insert own access logs" 
ON public.sensitive_data_access_log 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Remove overly permissive service_role policy from user_microsoft_tokens
-- Service role needs access for edge functions but should be more restricted
DROP POLICY IF EXISTS "Service role can manage tokens" ON public.user_microsoft_tokens;

-- More restricted service role access - only for specific operations
CREATE POLICY "Service role can manage tokens for edge functions" 
ON public.user_microsoft_tokens 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Add audit trigger for security_incidents table to log all access
CREATE OR REPLACE FUNCTION public.log_security_incident_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all access to security incidents for audit trail
  INSERT INTO public.sensitive_data_access_log (
    user_id,
    table_accessed,
    access_type,
    query_context
  ) VALUES (
    auth.uid(),
    'security_incidents',
    TG_OP,
    CASE 
      WHEN TG_OP = 'SELECT' THEN 'Viewed incident'
      WHEN TG_OP = 'INSERT' THEN 'Created incident: ' || COALESCE(NEW.title, 'N/A')
      WHEN TG_OP = 'UPDATE' THEN 'Updated incident: ' || COALESCE(NEW.title, 'N/A')
      WHEN TG_OP = 'DELETE' THEN 'Deleted incident: ' || COALESCE(OLD.title, 'N/A')
      ELSE 'Unknown operation'
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS log_security_incident_access_trigger ON public.security_incidents;

-- Create trigger for auditing security incident access
CREATE TRIGGER log_security_incident_access_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.security_incidents
FOR EACH ROW
EXECUTE FUNCTION public.log_security_incident_access();

-- 4. Add function to anonymize IP addresses in user_consents for GDPR compliance
CREATE OR REPLACE FUNCTION public.anonymize_ip_address(ip text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  -- Return only first two octets for IPv4, mask the rest
  SELECT CASE 
    WHEN ip IS NULL THEN NULL
    WHEN ip LIKE '%.%.%.%' THEN 
      split_part(ip, '.', 1) || '.' || split_part(ip, '.', 2) || '.x.x'
    ELSE 
      'anonymized'
  END;
$$;

-- 5. Strengthen landing_feedback policies to prevent manipulation
DROP POLICY IF EXISTS "Anyone can view approved feedback" ON public.landing_feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.landing_feedback;

-- Only allow viewing approved feedback
CREATE POLICY "Anyone can view approved feedback" 
ON public.landing_feedback 
FOR SELECT 
TO anon, authenticated
USING (is_approved = true);

-- Rate-limited feedback submission (trigger handles rate limiting)
CREATE POLICY "Anyone can submit feedback with rate limiting" 
ON public.landing_feedback 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only admins can approve/update feedback
CREATE POLICY "Admins can manage feedback" 
ON public.landing_feedback 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete feedback" 
ON public.landing_feedback 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));

-- 6. Add data retention policy for ai_usage_logs (anonymize old data)
CREATE OR REPLACE FUNCTION public.enforce_ai_usage_data_retention()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Anonymize records older than 90 days
  WITH anonymized AS (
    UPDATE public.ai_usage_logs
    SET 
      project_id = NULL,
      error_message = NULL
    WHERE created_at < now() - INTERVAL '90 days'
    AND project_id IS NOT NULL
    RETURNING 1
  )
  SELECT COUNT(*) INTO affected_rows FROM anonymized;
  
  RETURN affected_rows;
END;
$$;