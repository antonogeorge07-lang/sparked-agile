-- Remove duplicate INSERT policies (keep one clear policy)
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.landing_feedback;

-- Remove duplicate SELECT policies (keep one clear policy)
DROP POLICY IF EXISTS "Anyone can read approved feedback" ON public.landing_feedback;