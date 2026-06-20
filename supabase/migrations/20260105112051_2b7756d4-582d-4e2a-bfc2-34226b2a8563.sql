
-- Fix SECURITY DEFINER view by converting to SECURITY INVOKER
-- This ensures RLS policies are applied based on the querying user

-- Drop the old view
DROP VIEW IF EXISTS public.profiles_safe;

-- Recreate as a regular view (SECURITY INVOKER is default)
CREATE VIEW public.profiles_safe AS
SELECT 
  id,
  CASE 
    WHEN auth.uid() = id OR is_admin(auth.uid()) THEN email
    ELSE '***@' || split_part(email, '@', 2)
  END as email,
  CASE 
    WHEN auth.uid() = id OR is_admin(auth.uid()) THEN full_name
    ELSE COALESCE(split_part(full_name, ' ', 1), 'User')
  END as full_name,
  avatar_url,
  role,
  created_at,
  updated_at,
  anonymized
FROM profiles
WHERE anonymized = false OR auth.uid() = id;

-- Explicitly set SECURITY INVOKER to be clear
ALTER VIEW public.profiles_safe SET (security_invoker = true);

-- Re-grant access
GRANT SELECT ON public.profiles_safe TO authenticated;
