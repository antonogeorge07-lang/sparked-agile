DROP POLICY IF EXISTS "System can create nudges for project members" ON public.smart_nudges;
CREATE POLICY "Users can insert their own nudges in their projects"
ON public.smart_nudges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND is_pmi_project_member(project_id));