-- Fix remaining overly permissive RLS policies

-- 1. Fix integrations table - Remove service role policy
DROP POLICY IF EXISTS "Service role can manage integrations" ON public.integrations;

-- 2. Fix landing_feedback table - Remove permissive policies
DROP POLICY IF EXISTS "Anyone can submit feedback with rate limiting" ON public.landing_feedback;
DROP POLICY IF EXISTS "Anyone can submit landing feedback" ON public.landing_feedback;
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.landing_feedback;
DROP POLICY IF EXISTS "Public feedback submission" ON public.landing_feedback;

-- Create proper policy for authenticated users to submit feedback
CREATE POLICY "Authenticated users can submit feedback"
ON public.landing_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  name IS NOT NULL 
  AND feedback IS NOT NULL 
  AND length(feedback) > 10
  AND length(feedback) < 2000
);

-- 3. Fix sensitive_data_access_log - Remove permissive policies
DROP POLICY IF EXISTS "Service role can insert access logs" ON public.sensitive_data_access_log;
DROP POLICY IF EXISTS "System can insert access logs" ON public.sensitive_data_access_log;
DROP POLICY IF EXISTS "Authenticated system can insert access logs" ON public.sensitive_data_access_log;

-- Create proper policy - only authenticated users can insert their own access logs
CREATE POLICY "Users can log own access"
ON public.sensitive_data_access_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());