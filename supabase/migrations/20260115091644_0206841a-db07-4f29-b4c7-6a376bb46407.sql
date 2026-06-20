-- Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create token access audit table (without RLS policies that need has_role for now)
CREATE TABLE IF NOT EXISTS public.token_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_type TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.token_access_audit ENABLE ROW LEVEL SECURITY;

-- Simple policy - users can insert their own audit logs
CREATE POLICY "Users insert own token audit logs"
ON public.token_access_audit
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());