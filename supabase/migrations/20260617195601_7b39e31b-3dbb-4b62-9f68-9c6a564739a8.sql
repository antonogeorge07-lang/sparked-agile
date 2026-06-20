
-- 1. aggregation_access_limits: admin policy SELECT-only
DROP POLICY IF EXISTS "Admins can view aggregation limits" ON public.aggregation_access_limits;
CREATE POLICY "Admins can view aggregation limits"
  ON public.aggregation_access_limits
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

REVOKE INSERT, UPDATE, DELETE ON public.aggregation_access_limits FROM authenticated, anon;
GRANT SELECT ON public.aggregation_access_limits TO authenticated;
GRANT ALL ON public.aggregation_access_limits TO service_role;

-- 2. slack_api_rate_limits: remove user ALL policy, leave SELECT-only + service role write
DROP POLICY IF EXISTS "Users can manage own rate limits" ON public.slack_api_rate_limits;

REVOKE INSERT, UPDATE, DELETE ON public.slack_api_rate_limits FROM authenticated, anon;
GRANT SELECT ON public.slack_api_rate_limits TO authenticated;
GRANT ALL ON public.slack_api_rate_limits TO service_role;

-- 3. Prevent self privilege escalation via profiles.role
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only admins (or service_role/superuser bypassing RLS) may change roles.
    IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Role changes are not allowed. Roles must be managed via user_roles by an administrator.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();
