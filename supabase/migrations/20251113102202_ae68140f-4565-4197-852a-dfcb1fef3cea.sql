-- Create epic_milestones table for tracking epic milestones
CREATE TABLE IF NOT EXISTS public.epic_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create epic_progress_snapshots for burndown tracking
CREATE TABLE IF NOT EXISTS public.epic_progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES public.epics(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_features INTEGER NOT NULL DEFAULT 0,
  completed_features INTEGER NOT NULL DEFAULT 0,
  total_story_points INTEGER DEFAULT 0,
  completed_story_points INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  velocity NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_epic_snapshot_date UNIQUE (epic_id, snapshot_date)
);

-- Add velocity tracking fields to epics table
ALTER TABLE public.epics
ADD COLUMN IF NOT EXISTS target_velocity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_velocity NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMP WITH TIME ZONE;

-- Enable RLS on epic_milestones
ALTER TABLE public.epic_milestones ENABLE ROW LEVEL SECURITY;

-- Project members can view epic milestones
CREATE POLICY "Users can view epic milestones of allocated projects"
ON public.epic_milestones
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_milestones.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Project members can manage epic milestones
CREATE POLICY "Project members can manage epic milestones"
ON public.epic_milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_milestones.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Enable RLS on epic_progress_snapshots
ALTER TABLE public.epic_progress_snapshots ENABLE ROW LEVEL SECURITY;

-- Project members can view progress snapshots
CREATE POLICY "Users can view epic progress snapshots"
ON public.epic_progress_snapshots
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_progress_snapshots.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Project members can create progress snapshots
CREATE POLICY "Project members can create progress snapshots"
ON public.epic_progress_snapshots
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM epics e
    JOIN value_streams vs ON vs.id = e.value_stream_id
    JOIN project_members pm ON pm.project_id = vs.project_id
    WHERE e.id = epic_progress_snapshots.epic_id
    AND pm.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_epic_milestones_epic_id ON public.epic_milestones(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_milestones_target_date ON public.epic_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_epic_milestones_status ON public.epic_milestones(status);
CREATE INDEX IF NOT EXISTS idx_epic_progress_snapshots_epic_id ON public.epic_progress_snapshots(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_progress_snapshots_date ON public.epic_progress_snapshots(snapshot_date);

-- Function to calculate epic health score
CREATE OR REPLACE FUNCTION public.calculate_epic_health_score(epic_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  epic_record RECORD;
  completion_rate NUMERIC;
  time_elapsed NUMERIC;
  time_remaining NUMERIC;
  schedule_variance NUMERIC;
  missed_milestones INTEGER;
  health_score TEXT;
BEGIN
  -- Get epic details
  SELECT 
    e.*,
    COUNT(f.id) FILTER (WHERE f.status = 'completed') as completed_features,
    COUNT(f.id) as total_features,
    COUNT(m.id) FILTER (WHERE m.status = 'missed') as missed_milestone_count
  INTO epic_record
  FROM epics e
  LEFT JOIN features f ON f.epic_id = e.id
  LEFT JOIN epic_milestones m ON m.epic_id = e.id
  WHERE e.id = epic_id_param
  GROUP BY e.id;

  IF NOT FOUND THEN
    RETURN 'on_track';
  END IF;

  -- Calculate completion rate
  IF epic_record.total_features > 0 THEN
    completion_rate := epic_record.completed_features::NUMERIC / epic_record.total_features;
  ELSE
    completion_rate := 0;
  END IF;

  -- Calculate time metrics if dates are set
  IF epic_record.start_date IS NOT NULL AND epic_record.end_date IS NOT NULL THEN
    time_elapsed := (CURRENT_DATE - epic_record.start_date)::NUMERIC;
    time_remaining := (epic_record.end_date - CURRENT_DATE)::NUMERIC;
    
    -- Calculate schedule variance (should be close to completion_rate)
    IF (time_elapsed + time_remaining) > 0 THEN
      schedule_variance := completion_rate - (time_elapsed / (time_elapsed + time_remaining));
    ELSE
      schedule_variance := 0;
    END IF;
  ELSE
    schedule_variance := 0;
    time_remaining := 999;
  END IF;

  missed_milestones := COALESCE(epic_record.missed_milestone_count, 0);

  -- Determine health score based on multiple factors
  IF schedule_variance < -0.2 OR missed_milestones >= 2 OR time_remaining < 0 THEN
    health_score := 'critical';
  ELSIF schedule_variance < -0.1 OR missed_milestones >= 1 OR (time_remaining < 7 AND completion_rate < 0.8) THEN
    health_score := 'at_risk';
  ELSE
    health_score := 'on_track';
  END IF;

  -- Update epic health score
  UPDATE epics 
  SET health_score = health_score, 
      last_health_check = now()
  WHERE id = epic_id_param;

  RETURN health_score;
END;
$$;

-- Function to create daily progress snapshot
CREATE OR REPLACE FUNCTION public.create_epic_progress_snapshot(epic_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  feature_stats RECORD;
  recent_velocity NUMERIC;
BEGIN
  -- Get feature statistics
  SELECT 
    COUNT(*) as total_features,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_features,
    COALESCE(SUM(effort_estimate), 0) as total_points,
    COALESCE(SUM(effort_estimate) FILTER (WHERE status = 'completed'), 0) as completed_points
  INTO feature_stats
  FROM features
  WHERE epic_id = epic_id_param;

  -- Calculate recent velocity (last 7 days)
  SELECT COALESCE(AVG(completed_story_points), 0)
  INTO recent_velocity
  FROM epic_progress_snapshots
  WHERE epic_id = epic_id_param
  AND snapshot_date >= CURRENT_DATE - INTERVAL '7 days';

  -- Insert or update today's snapshot
  INSERT INTO epic_progress_snapshots (
    epic_id,
    snapshot_date,
    total_features,
    completed_features,
    total_story_points,
    completed_story_points,
    completion_percentage,
    velocity
  ) VALUES (
    epic_id_param,
    CURRENT_DATE,
    feature_stats.total_features,
    feature_stats.completed_features,
    feature_stats.total_points,
    feature_stats.completed_points,
    CASE 
      WHEN feature_stats.total_features > 0 
      THEN (feature_stats.completed_features * 100 / feature_stats.total_features)
      ELSE 0 
    END,
    recent_velocity
  )
  ON CONFLICT (epic_id, snapshot_date) 
  DO UPDATE SET
    total_features = EXCLUDED.total_features,
    completed_features = EXCLUDED.completed_features,
    total_story_points = EXCLUDED.total_story_points,
    completed_story_points = EXCLUDED.completed_story_points,
    completion_percentage = EXCLUDED.completion_percentage,
    velocity = EXCLUDED.velocity,
    created_at = now();

  -- Update epic velocity
  UPDATE epics
  SET current_velocity = recent_velocity
  WHERE id = epic_id_param;
END;
$$;

-- Trigger to update milestone status based on completion
CREATE OR REPLACE FUNCTION public.update_milestone_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-update status to missed if past target date and not completed
  IF NEW.completion_date IS NULL 
     AND NEW.target_date < CURRENT_DATE 
     AND NEW.status NOT IN ('completed', 'missed') THEN
    NEW.status := 'missed';
  END IF;

  -- Auto-update status to completed if completion_date is set
  IF NEW.completion_date IS NOT NULL AND NEW.status != 'completed' THEN
    NEW.status := 'completed';
    NEW.completion_percentage := 100;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_milestone_status_trigger
BEFORE INSERT OR UPDATE ON public.epic_milestones
FOR EACH ROW
EXECUTE FUNCTION update_milestone_status();