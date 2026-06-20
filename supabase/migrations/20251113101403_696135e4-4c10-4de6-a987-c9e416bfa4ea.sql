-- Create epic_dependencies table for tracking epic relationships
CREATE TABLE IF NOT EXISTS public.epic_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  depends_on_epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'relates_to', 'duplicates', 'precedes')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'removed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT different_epics CHECK (epic_id != depends_on_epic_id),
  CONSTRAINT unique_dependency UNIQUE (epic_id, depends_on_epic_id)
);

-- Enable RLS on epic_dependencies
ALTER TABLE public.epic_dependencies ENABLE ROW LEVEL SECURITY;

-- Project members can view epic dependencies
CREATE POLICY "Users can view epic dependencies of allocated projects"
ON public.epic_dependencies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_dependencies.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Project members can manage epic dependencies
CREATE POLICY "Project members can manage epic dependencies"
ON public.epic_dependencies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_dependencies.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_epic_dependencies_epic_id ON public.epic_dependencies(epic_id);
CREATE INDEX idx_epic_dependencies_depends_on ON public.epic_dependencies(depends_on_epic_id);
CREATE INDEX idx_epic_dependencies_status ON public.epic_dependencies(status);

-- Add display_order to features for drag-and-drop ordering
ALTER TABLE public.features
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_features_display_order ON public.features(epic_id, display_order);