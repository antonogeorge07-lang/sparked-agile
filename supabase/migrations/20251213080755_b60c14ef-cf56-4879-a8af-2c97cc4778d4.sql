-- Drop existing SELECT policies on ai_usage_logs
DROP POLICY IF EXISTS "Admins can view all AI usage" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Users can view their own AI usage" ON public.ai_usage_logs;

-- Create new policy allowing only platform owner to view all AI usage logs
CREATE POLICY "Only platform owner can view AI usage"
ON public.ai_usage_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.email = 'antono.george07@gmail.com'
  )
);