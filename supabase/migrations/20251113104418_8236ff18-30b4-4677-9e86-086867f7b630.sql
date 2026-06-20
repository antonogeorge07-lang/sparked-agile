-- Create epic_closure_reviews table for tracking closure process
CREATE TABLE IF NOT EXISTS public.epic_closure_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  closure_status TEXT NOT NULL DEFAULT 'pending' CHECK (closure_status IN ('pending', 'in_review', 'approved', 'rejected')),
  closure_date DATE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  acceptance_criteria_met BOOLEAN DEFAULT false,
  all_features_completed BOOLEAN DEFAULT false,
  documentation_complete BOOLEAN DEFAULT false,
  stakeholder_signoff BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_epic_closure UNIQUE (epic_id)
);

-- Create epic_impact_metrics table for post-delivery tracking
CREATE TABLE IF NOT EXISTS public.epic_impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('kpi', 'user_engagement', 'revenue', 'efficiency', 'quality', 'other')),
  baseline_value NUMERIC(15,2),
  target_value NUMERIC(15,2),
  current_value NUMERIC(15,2),
  measurement_date DATE DEFAULT CURRENT_DATE,
  measurement_unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create epic_roi_tracking table for ROI measurement
CREATE TABLE IF NOT EXISTS public.epic_roi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  investment_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  investment_currency TEXT DEFAULT 'USD',
  returns_amount NUMERIC(15,2) DEFAULT 0,
  roi_percentage NUMERIC(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN investment_amount > 0 
      THEN ((returns_amount - investment_amount) / investment_amount * 100)
      ELSE 0 
    END
  ) STORED,
  payback_period_days INTEGER,
  cost_breakdown JSONB DEFAULT '{}'::jsonb,
  revenue_breakdown JSONB DEFAULT '{}'::jsonb,
  calculation_notes TEXT,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_epic_roi UNIQUE (epic_id)
);

-- Add closure-related fields to epics table
ALTER TABLE public.epics
ADD COLUMN IF NOT EXISTS closure_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS closure_date DATE,
ADD COLUMN IF NOT EXISTS actual_roi NUMERIC(10,2);

-- Enable RLS on epic_closure_reviews
ALTER TABLE public.epic_closure_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view epic closure reviews of allocated projects"
ON public.epic_closure_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_closure_reviews.epic_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage epic closure reviews"
ON public.epic_closure_reviews
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_closure_reviews.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Enable RLS on epic_impact_metrics
ALTER TABLE public.epic_impact_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view epic impact metrics of allocated projects"
ON public.epic_impact_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_impact_metrics.epic_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage epic impact metrics"
ON public.epic_impact_metrics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_impact_metrics.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Enable RLS on epic_roi_tracking
ALTER TABLE public.epic_roi_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view epic ROI of allocated projects"
ON public.epic_roi_tracking
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_roi_tracking.epic_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage epic ROI"
ON public.epic_roi_tracking
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_roi_tracking.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_epic_closure_reviews_epic_id ON public.epic_closure_reviews(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_closure_reviews_status ON public.epic_closure_reviews(closure_status);
CREATE INDEX IF NOT EXISTS idx_epic_impact_metrics_epic_id ON public.epic_impact_metrics(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_impact_metrics_type ON public.epic_impact_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_epic_roi_tracking_epic_id ON public.epic_roi_tracking(epic_id);

-- Function to initialize epic closure review with default checklist
CREATE OR REPLACE FUNCTION public.initialize_epic_closure_review(epic_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  new_review_id UUID;
  default_checklist JSONB;
BEGIN
  -- Default closure checklist
  default_checklist := '[
    {"id": "acceptance_criteria", "label": "All acceptance criteria met", "completed": false},
    {"id": "features_complete", "label": "All features completed and tested", "completed": false},
    {"id": "documentation", "label": "Documentation complete and reviewed", "completed": false},
    {"id": "stakeholder_demo", "label": "Demo presented to stakeholders", "completed": false},
    {"id": "stakeholder_signoff", "label": "Stakeholder sign-off obtained", "completed": false},
    {"id": "lessons_learned", "label": "Lessons learned documented", "completed": false},
    {"id": "impact_metrics", "label": "Success metrics defined and baselined", "completed": false},
    {"id": "handover", "label": "Handover to operations/support complete", "completed": false}
  ]'::jsonb;

  -- Insert or get existing closure review
  INSERT INTO epic_closure_reviews (
    epic_id,
    closure_status,
    checklist_items,
    created_by
  ) VALUES (
    epic_id_param,
    'pending',
    default_checklist,
    auth.uid()
  )
  ON CONFLICT (epic_id) 
  DO NOTHING
  RETURNING id INTO new_review_id;

  -- If already exists, get the ID
  IF new_review_id IS NULL THEN
    SELECT id INTO new_review_id
    FROM epic_closure_reviews
    WHERE epic_id = epic_id_param;
  END IF;

  RETURN new_review_id;
END;
$$;

-- Function to calculate epic closure readiness
CREATE OR REPLACE FUNCTION public.calculate_closure_readiness(epic_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  result JSONB;
  feature_stats RECORD;
  milestone_stats RECORD;
  closure_review RECORD;
  readiness_score INTEGER;
  blockers JSONB[];
BEGIN
  -- Get feature completion statistics
  SELECT 
    COUNT(*) as total_features,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_features
  INTO feature_stats
  FROM features
  WHERE epic_id = epic_id_param;

  -- Get milestone statistics
  SELECT 
    COUNT(*) as total_milestones,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_milestones,
    COUNT(*) FILTER (WHERE status = 'missed') as missed_milestones
  INTO milestone_stats
  FROM epic_milestones
  WHERE epic_id = epic_id_param;

  -- Get closure review
  SELECT * INTO closure_review
  FROM epic_closure_reviews
  WHERE epic_id = epic_id_param;

  -- Initialize blockers array
  blockers := ARRAY[]::JSONB[];

  -- Calculate readiness score (0-100)
  readiness_score := 0;

  -- Features (40 points)
  IF feature_stats.total_features > 0 THEN
    readiness_score := readiness_score + (feature_stats.completed_features * 40 / feature_stats.total_features);
  ELSE
    readiness_score := readiness_score + 40;
  END IF;

  -- Milestones (30 points)
  IF milestone_stats.total_milestones > 0 THEN
    readiness_score := readiness_score + (milestone_stats.completed_milestones * 30 / milestone_stats.total_milestones);
    
    IF milestone_stats.missed_milestones > 0 THEN
      blockers := array_append(blockers, format('{"type": "missed_milestones", "count": %s}', milestone_stats.missed_milestones)::jsonb);
    END IF;
  ELSE
    readiness_score := readiness_score + 30;
  END IF;

  -- Closure review checklist (30 points)
  IF closure_review.id IS NOT NULL THEN
    DECLARE
      checklist_total INTEGER;
      checklist_completed INTEGER;
    BEGIN
      SELECT COUNT(*), COUNT(*) FILTER (WHERE (item->>'completed')::boolean = true)
      INTO checklist_total, checklist_completed
      FROM jsonb_array_elements(COALESCE(closure_review.checklist_items, '[]'::jsonb)) as item;
      
      IF checklist_total > 0 THEN
        readiness_score := readiness_score + (checklist_completed * 30 / checklist_total);
      END IF;
    END;
  END IF;

  -- Identify blockers
  IF feature_stats.completed_features < feature_stats.total_features THEN
    blockers := array_append(blockers, 
      format('{"type": "incomplete_features", "remaining": %s}', 
        feature_stats.total_features - feature_stats.completed_features)::jsonb);
  END IF;

  IF closure_review.id IS NULL OR closure_review.closure_status = 'rejected' THEN
    blockers := array_append(blockers, '{"type": "no_closure_review", "message": "Closure review not initiated"}'::jsonb);
  END IF;

  -- Build result
  result := jsonb_build_object(
    'readiness_score', readiness_score,
    'ready_to_close', readiness_score >= 80,
    'blockers', COALESCE(array_to_json(blockers)::jsonb, '[]'::jsonb),
    'feature_completion', 
      CASE WHEN feature_stats.total_features > 0 
      THEN round((feature_stats.completed_features::numeric / feature_stats.total_features) * 100)
      ELSE 100 END,
    'milestone_completion',
      CASE WHEN milestone_stats.total_milestones > 0
      THEN round((milestone_stats.completed_milestones::numeric / milestone_stats.total_milestones) * 100)
      ELSE 100 END
  );

  RETURN result;
END;
$$;

-- Trigger to update epic status when closure is approved
CREATE OR REPLACE FUNCTION public.update_epic_on_closure_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  IF NEW.closure_status = 'approved' AND (OLD.closure_status IS NULL OR OLD.closure_status != 'approved') THEN
    UPDATE epics
    SET 
      status = 'completed',
      closure_approved = true,
      closure_date = COALESCE(NEW.closure_date, CURRENT_DATE),
      updated_at = now()
    WHERE id = NEW.epic_id;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER epic_closure_approval_trigger
BEFORE UPDATE ON public.epic_closure_reviews
FOR EACH ROW
EXECUTE FUNCTION update_epic_on_closure_approval();