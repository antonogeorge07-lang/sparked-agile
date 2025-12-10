-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view active surveys" ON public.satisfaction_surveys;

-- Create a more restrictive policy: only authenticated users can view active surveys
-- This prevents anonymous scraping while still allowing legitimate users to participate
CREATE POLICY "Authenticated users can view active surveys"
ON public.satisfaction_surveys
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Ensure the admin policy covers all operations with proper WITH CHECK
DROP POLICY IF EXISTS "Admins can manage surveys" ON public.satisfaction_surveys;

CREATE POLICY "Admins can manage all surveys"
ON public.satisfaction_surveys
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));