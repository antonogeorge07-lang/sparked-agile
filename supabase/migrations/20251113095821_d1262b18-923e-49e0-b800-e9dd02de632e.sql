-- ============================================
-- PHASE 1: EPIC MANAGEMENT DATABASE SCHEMA
-- ============================================

-- Add missing fields to epics table
ALTER TABLE public.epics 
  ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT[],
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS business_justification TEXT,
  ADD COLUMN IF NOT EXISTS strategic_goals TEXT[],
  ADD COLUMN IF NOT EXISTS effort_estimate INTEGER,
  ADD COLUMN IF NOT EXISTS roi_score NUMERIC,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS responsible_teams UUID[],
  ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#8B5CF6',
  ADD COLUMN IF NOT EXISTS health_score TEXT DEFAULT 'on_track';

-- Add check constraint for health_score
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'epics_health_score_check'
  ) THEN
    ALTER TABLE public.epics 
      ADD CONSTRAINT epics_health_score_check 
      CHECK (health_score IN ('on_track', 'at_risk', 'critical'));
  END IF;
END $$;

-- Create epic_stakeholders junction table
CREATE TABLE IF NOT EXISTS public.epic_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(epic_id, user_id, role)
);

-- Enable RLS on epic_stakeholders
ALTER TABLE public.epic_stakeholders ENABLE ROW LEVEL SECURITY;

-- RLS policies for epic_stakeholders
CREATE POLICY "Project members can view epic stakeholders"
  ON public.epic_stakeholders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_stakeholders.epic_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage epic stakeholders"
  ON public.epic_stakeholders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_stakeholders.epic_id
      AND pm.user_id = auth.uid()
    )
  );

-- Create function to calculate epic progress
CREATE OR REPLACE FUNCTION public.calculate_epic_progress(epic_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(
      (COUNT(*) FILTER (WHERE f.status = 'completed') * 100) / 
      NULLIF(COUNT(*), 0),
      0
    )::INTEGER
  FROM features f
  WHERE f.epic_id = epic_id_param;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_epics_value_stream_id ON public.epics(value_stream_id);
CREATE INDEX IF NOT EXISTS idx_epics_status ON public.epics(status);
CREATE INDEX IF NOT EXISTS idx_epics_priority ON public.epics(priority);
CREATE INDEX IF NOT EXISTS idx_epics_created_by ON public.epics(created_by);
CREATE INDEX IF NOT EXISTS idx_epic_stakeholders_epic_id ON public.epic_stakeholders(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_stakeholders_user_id ON public.epic_stakeholders(user_id);