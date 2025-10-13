-- SAFe 6.0 Implementation: Value Streams and Flow

-- Create value streams table
CREATE TABLE public.value_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.value_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view value streams of allocated projects"
ON public.value_streams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = value_streams.project_id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage value streams"
ON public.value_streams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = value_streams.project_id
    AND project_members.user_id = auth.uid()
  )
);

-- Create agile release trains (ARTs)
CREATE TABLE public.agile_release_trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  value_stream_id UUID REFERENCES public.value_streams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.agile_release_trains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ARTs of allocated value streams"
ON public.agile_release_trains FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM value_streams
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE agile_release_trains.value_stream_id = value_streams.id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage ARTs"
ON public.agile_release_trains FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM value_streams
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE agile_release_trains.value_stream_id = value_streams.id
    AND project_members.user_id = auth.uid()
  )
);

-- Create program increments (PIs)
CREATE TABLE public.program_increments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  art_id UUID REFERENCES public.agile_release_trains(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  objectives TEXT,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.program_increments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view PIs of allocated ARTs"
ON public.program_increments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agile_release_trains
    JOIN value_streams ON value_streams.id = agile_release_trains.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE program_increments.art_id = agile_release_trains.id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage PIs"
ON public.program_increments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM agile_release_trains
    JOIN value_streams ON value_streams.id = agile_release_trains.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE program_increments.art_id = agile_release_trains.id
    AND project_members.user_id = auth.uid()
  )
);

-- Create epics (portfolio level)
CREATE TABLE public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  value_stream_id UUID REFERENCES public.value_streams(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'backlog',
  priority TEXT DEFAULT 'medium',
  business_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view epics of allocated value streams"
ON public.epics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM value_streams
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE epics.value_stream_id = value_streams.id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage epics"
ON public.epics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM value_streams
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE epics.value_stream_id = value_streams.id
    AND project_members.user_id = auth.uid()
  )
);

-- Create features (breaks down epics)
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  epic_id UUID REFERENCES public.epics(id) ON DELETE SET NULL,
  pi_id UUID REFERENCES public.program_increments(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'backlog',
  priority TEXT DEFAULT 'medium',
  effort_estimate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view features of allocated epics"
ON public.features FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM epics
    JOIN value_streams ON value_streams.id = epics.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE features.epic_id = epics.id
    AND project_members.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM program_increments
    JOIN agile_release_trains ON agile_release_trains.id = program_increments.art_id
    JOIN value_streams ON value_streams.id = agile_release_trains.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE features.pi_id = program_increments.id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage features"
ON public.features FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM epics
    JOIN value_streams ON value_streams.id = epics.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE features.epic_id = epics.id
    AND project_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM program_increments
    JOIN agile_release_trains ON agile_release_trains.id = program_increments.art_id
    JOIN value_streams ON value_streams.id = agile_release_trains.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE features.pi_id = program_increments.id
    AND project_members.user_id = auth.uid()
  )
);

-- Create dependencies table
CREATE TABLE public.dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE,
  dependent_feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dependencies of allocated features"
ON public.dependencies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM features
    JOIN epics ON epics.id = features.epic_id
    JOIN value_streams ON value_streams.id = epics.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE (dependencies.source_feature_id = features.id OR dependencies.dependent_feature_id = features.id)
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage dependencies"
ON public.dependencies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM features
    JOIN epics ON epics.id = features.epic_id
    JOIN value_streams ON value_streams.id = epics.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE (dependencies.source_feature_id = features.id OR dependencies.dependent_feature_id = features.id)
    AND project_members.user_id = auth.uid()
  )
);

-- Create OKRs (Objectives and Key Results)
CREATE TABLE public.okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pi_id UUID REFERENCES public.program_increments(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'objective',
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view OKRs of allocated PIs"
ON public.okrs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM program_increments
    JOIN agile_release_trains ON agile_release_trains.id = program_increments.art_id
    JOIN value_streams ON value_streams.id = agile_release_trains.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE okrs.pi_id = program_increments.id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage OKRs"
ON public.okrs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM program_increments
    JOIN agile_release_trains ON agile_release_trains.id = program_increments.art_id
    JOIN value_streams ON value_streams.id = agile_release_trains.value_stream_id
    JOIN project_members ON project_members.project_id = value_streams.project_id
    WHERE okrs.pi_id = program_increments.id
    AND project_members.user_id = auth.uid()
  )
);

-- Create flow metrics table
CREATE TABLE public.flow_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  work_in_progress INTEGER DEFAULT 0,
  cycle_time_avg NUMERIC,
  lead_time_avg NUMERIC,
  throughput INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.flow_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flow metrics of allocated projects"
ON public.flow_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = flow_metrics.project_id
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can manage flow metrics"
ON public.flow_metrics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = flow_metrics.project_id
    AND project_members.user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_value_streams_updated_at
BEFORE UPDATE ON public.value_streams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agile_release_trains_updated_at
BEFORE UPDATE ON public.agile_release_trains
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_increments_updated_at
BEFORE UPDATE ON public.program_increments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_epics_updated_at
BEFORE UPDATE ON public.epics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_features_updated_at
BEFORE UPDATE ON public.features
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_okrs_updated_at
BEFORE UPDATE ON public.okrs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();