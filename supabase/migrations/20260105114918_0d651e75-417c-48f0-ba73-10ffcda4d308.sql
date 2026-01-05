
-- Add SELECT policy for users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Add comment documenting security measures for profiles
COMMENT ON TABLE public.profiles IS 'User profiles with RLS: users can only access their own profile, admins can view all';

-- Add comment documenting security measures for tokens
COMMENT ON TABLE public.user_microsoft_tokens IS 'Microsoft OAuth tokens - encrypted at rest, RLS restricted to token owner only, with encryption versioning for key rotation';
