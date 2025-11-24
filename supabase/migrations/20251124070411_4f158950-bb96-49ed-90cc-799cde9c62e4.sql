-- Ensure anyone can submit feedback to landing_feedback
DROP POLICY IF EXISTS "Anyone can submit landing feedback" ON public.landing_feedback;

CREATE POLICY "Anyone can submit landing feedback"
ON public.landing_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure anyone can view approved feedback
DROP POLICY IF EXISTS "Anyone can view approved feedback" ON public.landing_feedback;

CREATE POLICY "Anyone can view approved feedback"
ON public.landing_feedback
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- Admin policy to manage all feedback
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.landing_feedback;

CREATE POLICY "Admins can manage all feedback"
ON public.landing_feedback
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));