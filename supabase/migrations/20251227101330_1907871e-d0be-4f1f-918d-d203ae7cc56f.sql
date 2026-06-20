-- Fix token table policies: Change from 'public' role to 'authenticated' for better security
-- This ensures only authenticated users can access their tokens

-- 1. Fix user_github_tokens policies
DROP POLICY IF EXISTS "Users can view their own GitHub token" ON public.user_github_tokens;
DROP POLICY IF EXISTS "Users can insert their own GitHub token" ON public.user_github_tokens;
DROP POLICY IF EXISTS "Users can update their own GitHub token" ON public.user_github_tokens;
DROP POLICY IF EXISTS "Users can delete their own GitHub token" ON public.user_github_tokens;

CREATE POLICY "Users can view their own GitHub token" 
ON public.user_github_tokens 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub token" 
ON public.user_github_tokens 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub token" 
ON public.user_github_tokens 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub token" 
ON public.user_github_tokens 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix user_jira_tokens policies
DROP POLICY IF EXISTS "Users can view their own Jira token" ON public.user_jira_tokens;
DROP POLICY IF EXISTS "Users can insert their own Jira token" ON public.user_jira_tokens;
DROP POLICY IF EXISTS "Users can update their own Jira token" ON public.user_jira_tokens;
DROP POLICY IF EXISTS "Users can delete their own Jira token" ON public.user_jira_tokens;

CREATE POLICY "Users can view their own Jira token" 
ON public.user_jira_tokens 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Jira token" 
ON public.user_jira_tokens 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Jira token" 
ON public.user_jira_tokens 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Jira token" 
ON public.user_jira_tokens 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 3. Fix user_slack_tokens policies
DROP POLICY IF EXISTS "Users can manage own Slack tokens" ON public.user_slack_tokens;

CREATE POLICY "Users can view their own Slack token" 
ON public.user_slack_tokens 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Slack token" 
ON public.user_slack_tokens 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Slack token" 
ON public.user_slack_tokens 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Slack token" 
ON public.user_slack_tokens 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 4. Add missing INSERT and UPDATE policies for user_microsoft_tokens
CREATE POLICY "Users can insert own tokens" 
ON public.user_microsoft_tokens 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" 
ON public.user_microsoft_tokens 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Fix webhooks policies
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can create their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;

CREATE POLICY "Users can view their own webhooks" 
ON public.webhooks 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks" 
ON public.webhooks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks" 
ON public.webhooks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" 
ON public.webhooks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);