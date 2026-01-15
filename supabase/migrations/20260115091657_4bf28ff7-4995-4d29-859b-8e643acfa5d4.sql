-- Add admin view policy for audit logs
CREATE POLICY "Admins can view token audit logs"
ON public.token_access_audit
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));