-- Add explicit RESTRICTIVE policies to ensure only authenticated users can access data
-- This provides defense-in-depth by explicitly blocking anonymous access

-- For profiles table: Add restrictive policy requiring authentication
CREATE POLICY "Require authentication for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- For user_microsoft_tokens: Add restrictive policy requiring authentication  
CREATE POLICY "Require authentication for tokens"
ON public.user_microsoft_tokens
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Add comment documenting security measures
COMMENT ON TABLE public.profiles IS 'User profiles - RLS enabled with restrictive authentication policy. All access requires authenticated user.';
COMMENT ON TABLE public.user_microsoft_tokens IS 'Microsoft OAuth tokens - RLS enabled with restrictive authentication policy. Tokens are encrypted. Only token owners can access their own records.';