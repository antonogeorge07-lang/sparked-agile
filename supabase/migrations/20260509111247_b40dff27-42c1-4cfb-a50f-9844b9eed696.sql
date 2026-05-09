-- Allow multiple workspaces per owner (drop UNIQUE on owner_id) so we can host a Training Demo workspace
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_owner_id_key;

-- Mark workspaces and projects as demo (read-only sample data for all users)
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.projects   ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_workspaces_is_demo ON public.workspaces(is_demo) WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_projects_is_demo   ON public.projects(is_demo)   WHERE is_demo = true;

-- Read-only access for any signed-in user to demo content
CREATE POLICY "Anyone authenticated can view demo workspaces"
  ON public.workspaces FOR SELECT TO authenticated
  USING (is_demo = true);

CREATE POLICY "Anyone authenticated can view demo projects"
  ON public.projects FOR SELECT TO authenticated
  USING (is_demo = true);

CREATE POLICY "Anyone authenticated can view demo sprint velocity"
  ON public.sprint_velocity_history FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE is_demo = true));

CREATE POLICY "Anyone authenticated can view demo project tasks"
  ON public.project_tasks FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE is_demo = true));

CREATE POLICY "Anyone authenticated can view demo project knowledge base"
  ON public.project_knowledge_base FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE is_demo = true));