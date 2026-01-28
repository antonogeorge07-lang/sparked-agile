-- =====================================================
-- Security Incident Access Control Enhancement
-- =====================================================

-- Create a function to check if user is the platform owner
CREATE OR REPLACE FUNCTION public.is_platform_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
    AND email = 'antono.george07@gmail.com'
  );
$$;

-- Create a function to check if user has security admin role
CREATE OR REPLACE FUNCTION public.is_security_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_platform_owner(user_id) OR public.has_role(user_id, 'admin'::app_role);
$$;

-- Drop existing policies on security_incidents
DROP POLICY IF EXISTS "Admins can view all security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Admins can insert security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Admins can update security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Admins can delete security incidents" ON public.security_incidents;

-- Create more restrictive policies with audit logging
-- Only platform owner can view security incidents
CREATE POLICY "Only platform owner can view security incidents"
ON public.security_incidents
FOR SELECT
TO authenticated
USING (public.is_platform_owner(auth.uid()));

-- Only platform owner can create security incidents
CREATE POLICY "Only platform owner can insert security incidents"
ON public.security_incidents
FOR INSERT
TO authenticated
WITH CHECK (public.is_platform_owner(auth.uid()));

-- Only platform owner can update security incidents
CREATE POLICY "Only platform owner can update security incidents"
ON public.security_incidents
FOR UPDATE
TO authenticated
USING (public.is_platform_owner(auth.uid()));

-- Only platform owner can delete security incidents
CREATE POLICY "Only platform owner can delete security incidents"
ON public.security_incidents
FOR DELETE
TO authenticated
USING (public.is_platform_owner(auth.uid()));

-- =====================================================
-- Enhanced Profile Email Protection
-- =====================================================

-- Create a function to mask teammate emails - only show domain
CREATE OR REPLACE FUNCTION public.mask_teammate_email(email_value text, profile_owner_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return full email for profile owner or platform owner
  IF auth.uid() = profile_owner_id OR is_platform_owner(auth.uid()) THEN
    RETURN email_value;
  END IF;
  
  -- Return NULL for all others - no email visibility
  RETURN NULL;
END;
$$;

-- =====================================================
-- Data Breach Log Access Audit Enhancement  
-- =====================================================

-- Create function to safely access breach logs with audit
CREATE OR REPLACE FUNCTION public.get_data_breach_with_audit(breach_id_param uuid DEFAULT NULL)
RETURNS SETOF data_breach_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Only platform owner can access breach logs
  IF NOT is_platform_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only platform owner can access breach logs';
  END IF;
  
  -- Get user email for audit
  SELECT email INTO user_email FROM profiles WHERE id = auth.uid();
  
  -- Create audit record with hash
  INSERT INTO data_breach_access_audit (
    user_id,
    user_email,
    action,
    breach_id,
    record_hash,
    ip_address_hash,
    user_agent
  ) VALUES (
    auth.uid(),
    user_email,
    CASE WHEN breach_id_param IS NULL THEN 'list_all' ELSE 'view_single' END,
    breach_id_param,
    generate_breach_audit_hash(auth.uid(), 'access', breach_id_param, now()),
    hash_ip_address(current_setting('request.headers', true)::json->>'x-forwarded-for'),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  -- Return data
  IF breach_id_param IS NULL THEN
    RETURN QUERY SELECT * FROM data_breach_log ORDER BY detected_at DESC;
  ELSE
    RETURN QUERY SELECT * FROM data_breach_log WHERE id = breach_id_param;
  END IF;
END;
$$;