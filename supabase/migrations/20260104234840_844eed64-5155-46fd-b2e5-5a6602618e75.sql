
-- =====================================================
-- SECURITY HARDENING MIGRATION
-- =====================================================

-- 1. Fix profiles table: Remove redundant SELECT policy
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;

-- 2. Restrict user_microsoft_tokens: Remove overly permissive service_role policy
-- Service role bypasses RLS anyway, so explicit policy with 'true' is unnecessary
DROP POLICY IF EXISTS "Service role can manage tokens for edge functions" ON public.user_microsoft_tokens;

-- 3. Add access logging function for sensitive tables
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sensitive_data_access_log (
    user_id,
    table_accessed,
    access_type,
    ip_address,
    query_context
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.path', true)
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 4. Add audit triggers for security_incidents table
DROP TRIGGER IF EXISTS audit_security_incidents_access ON public.security_incidents;
CREATE TRIGGER audit_security_incidents_access
  AFTER INSERT OR UPDATE OR DELETE ON public.security_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();

-- 5. Add audit triggers for user_microsoft_tokens table
DROP TRIGGER IF EXISTS audit_microsoft_tokens_access ON public.user_microsoft_tokens;
CREATE TRIGGER audit_microsoft_tokens_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_microsoft_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();

-- 6. Add audit triggers for profiles table (for admin access)
DROP TRIGGER IF EXISTS audit_profiles_access ON public.profiles;
CREATE TRIGGER audit_profiles_access
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();

-- 7. Add RLS policies for sensitive_data_access_log (only admins can view)
ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view access logs" ON public.sensitive_data_access_log;
CREATE POLICY "Only admins can view access logs"
  ON public.sensitive_data_access_log
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Allow the trigger function to insert (runs as SECURITY DEFINER)
DROP POLICY IF EXISTS "System can insert access logs" ON public.sensitive_data_access_log;
CREATE POLICY "System can insert access logs"
  ON public.sensitive_data_access_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. Ensure profiles INSERT policy exists for new user registration
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
