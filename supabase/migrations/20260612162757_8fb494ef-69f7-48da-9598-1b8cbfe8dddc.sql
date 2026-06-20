DROP POLICY IF EXISTS "Only admins can manage breach log" ON public.data_breach_log;
DROP POLICY IF EXISTS "Only security admins can view breach logs" ON public.data_breach_log;
DROP POLICY IF EXISTS "Security admins can insert breach logs" ON public.data_breach_log;

CREATE POLICY "Platform owner can view breach logs"
ON public.data_breach_log FOR SELECT
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Platform owner can insert breach logs"
ON public.data_breach_log FOR INSERT
WITH CHECK (is_platform_owner(auth.uid()));