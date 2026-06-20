-- Fix INSERT policy on pmi_tasks to validate project ownership
DROP POLICY IF EXISTS "Users can create tasks in their projects" ON pmi_tasks;

CREATE POLICY "Users can create tasks in their projects"
ON pmi_tasks
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = pmi_tasks.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);