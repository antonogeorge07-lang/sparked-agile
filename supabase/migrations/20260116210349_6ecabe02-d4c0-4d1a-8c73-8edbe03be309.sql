
-- Fix Issue 1: profiles table - Remove overly permissive policy
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Drop and recreate profiles_safe view with only safe fields
DROP VIEW IF EXISTS public.profiles_safe CASCADE;
CREATE VIEW public.profiles_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Drop old SELECT policy and create more restrictive one
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Allow users to view own profile OR teammates in shared projects
CREATE POLICY "Users can view own profile and teammates"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id  -- Own profile
  OR EXISTS (
    SELECT 1 FROM public.project_members pm1
    JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
  )
);

-- Fix Issue 2: user_microsoft_tokens - Remove overly permissive policy
DROP POLICY IF EXISTS "Require authentication for tokens" ON public.user_microsoft_tokens;

-- Drop and recreate tokens view without sensitive encrypted fields
DROP VIEW IF EXISTS public.user_microsoft_tokens_safe CASCADE;
CREATE VIEW public.user_microsoft_tokens_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  expires_at,
  scopes,
  user_email,
  is_valid,
  last_validated_at,
  validation_error,
  created_at,
  updated_at
FROM public.user_microsoft_tokens;
