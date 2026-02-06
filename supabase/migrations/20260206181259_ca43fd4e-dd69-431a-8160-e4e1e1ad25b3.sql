
-- =====================================================
-- Epic Validation Workflow Tables
-- =====================================================

-- 1. Stores each validation run with full AI output
CREATE TABLE public.epic_validation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  run_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'stakeholder_review', 'approved', 'rejected', 'recalibrated')),
  ai_summary TEXT,
  verdict_alignment TEXT CHECK (verdict_alignment IN ('aligned', 'misaligned', 'requires_review')),
  verdict_summary TEXT,
  delivery_alignment_check TEXT,
  effort_analysis JSONB DEFAULT '{}'::jsonb,
  next_steps TEXT[] DEFAULT '{}',
  features_analysed INTEGER DEFAULT 0,
  dependencies_checked INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Stores per-item validation decisions
CREATE TABLE public.epic_validation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_run_id UUID NOT NULL REFERENCES public.epic_validation_runs(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES public.features(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  current_status TEXT,
  ai_decision TEXT NOT NULL CHECK (ai_decision IN ('implement', 'review', 'do_not_implement')),
  final_decision TEXT CHECK (final_decision IN ('implement', 'review', 'do_not_implement', 'merged', 'archived')),
  ai_reasoning TEXT,
  ai_recommendation TEXT,
  stakeholder_notes TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Stores backlog recalibration actions taken after validation
CREATE TABLE public.epic_recalibration_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  validation_run_id UUID NOT NULL REFERENCES public.epic_validation_runs(id) ON DELETE CASCADE,
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('archived', 'merged', 'reordered', 'rescoped', 'dependency_updated', 'roadmap_updated')),
  target_feature_id UUID REFERENCES public.features(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  performed_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Execution readiness checklist per epic
CREATE TABLE public.epic_readiness_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  validation_run_id UUID REFERENCES public.epic_validation_runs(id) ON DELETE SET NULL,
  check_type TEXT NOT NULL CHECK (check_type IN ('dor_compliance', 'technical_dependency', 'environment_ready', 'api_ready', 'data_ready', 'devops_ready', 'stakeholder_signoff')),
  check_name TEXT NOT NULL,
  is_passed BOOLEAN DEFAULT false,
  notes TEXT,
  checked_by UUID,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add validation_status column to features for tagging
ALTER TABLE public.features 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT NULL 
CHECK (validation_status IN ('validated', 'flagged', 'rejected', NULL));

ALTER TABLE public.features 
ADD COLUMN IF NOT EXISTS validation_notes TEXT DEFAULT NULL;

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.epic_validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epic_validation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epic_recalibration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epic_readiness_checks ENABLE ROW LEVEL SECURITY;

-- epic_validation_runs: users who can see the epic can see validation runs
CREATE POLICY "Users can view validation runs for accessible epics"
  ON public.epic_validation_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_validation_runs.epic_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create validation runs for their epics"
  ON public.epic_validation_runs FOR INSERT
  WITH CHECK (auth.uid() = run_by);

CREATE POLICY "Users can update validation runs they have access to"
  ON public.epic_validation_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_validation_runs.epic_id
      AND pm.user_id = auth.uid()
    )
  );

-- epic_validation_items: follow parent run access
CREATE POLICY "Users can view validation items via run access"
  ON public.epic_validation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.epic_validation_runs r
      JOIN public.epics e ON e.id = r.epic_id
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE r.id = epic_validation_items.validation_run_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert validation items"
  ON public.epic_validation_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.epic_validation_runs r
      WHERE r.id = epic_validation_items.validation_run_id
      AND r.run_by = auth.uid()
    )
  );

CREATE POLICY "Users can update validation items they have access to"
  ON public.epic_validation_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.epic_validation_runs r
      JOIN public.epics e ON e.id = r.epic_id
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE r.id = epic_validation_items.validation_run_id
      AND pm.user_id = auth.uid()
    )
  );

-- epic_recalibration_log
CREATE POLICY "Users can view recalibration logs for accessible epics"
  ON public.epic_recalibration_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_recalibration_log.epic_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recalibration logs"
  ON public.epic_recalibration_log FOR INSERT
  WITH CHECK (auth.uid() = performed_by);

-- epic_readiness_checks
CREATE POLICY "Users can view readiness checks for accessible epics"
  ON public.epic_readiness_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_readiness_checks.epic_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage readiness checks for accessible epics"
  ON public.epic_readiness_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_readiness_checks.epic_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update readiness checks for accessible epics"
  ON public.epic_readiness_checks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.epics e
      JOIN public.value_streams vs ON vs.id = e.value_stream_id
      JOIN public.project_members pm ON pm.project_id = vs.project_id
      WHERE e.id = epic_readiness_checks.epic_id
      AND pm.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_epic_validation_runs_updated_at
  BEFORE UPDATE ON public.epic_validation_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_epic_readiness_checks_updated_at
  BEFORE UPDATE ON public.epic_readiness_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
