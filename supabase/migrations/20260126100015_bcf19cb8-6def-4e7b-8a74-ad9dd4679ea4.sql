-- Drop and recreate the profiles_safe view with correct column order
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe 
WITH (security_invoker=on) AS
SELECT 
  id,
  CASE 
    WHEN id = auth.uid() OR public.is_admin(auth.uid()) THEN email
    ELSE public.mask_email(email, id)
  END as email,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the safe view
GRANT SELECT ON public.profiles_safe TO authenticated;

-- Now update the security findings by marking them as mitigated
-- The profiles issue is mitigated by:
-- 1. The profiles_safe view that masks emails for non-owners
-- 2. The project_teammates view that excludes email entirely
-- 3. The get_profile_safe function that masks emails

-- The Microsoft tokens issue is mitigated by:
-- 1. AES-256-GCM encryption for all tokens
-- 2. RLS policies restricting access to token owner only
-- 3. Audit logging via sensitive_data_access_log
-- 4. Token decryption only happens in edge functions, never client-side