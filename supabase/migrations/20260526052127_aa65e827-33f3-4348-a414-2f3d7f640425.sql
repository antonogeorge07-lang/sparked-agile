
-- 1. Backfill: ensure every project creator is in project_members as owner
INSERT INTO public.project_members (project_id, user_id, role)
SELECT p.id, p.user_id, 'owner'
FROM public.projects p
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p.id AND pm.user_id = p.user_id
  )
ON CONFLICT DO NOTHING;

-- 2. Add explicit INSERT policy with WITH CHECK for value_streams
DROP POLICY IF EXISTS "Project members can create value streams" ON public.value_streams;
CREATE POLICY "Project members can create value streams"
ON public.value_streams
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = value_streams.project_id
      AND project_members.user_id = auth.uid()
  )
);
