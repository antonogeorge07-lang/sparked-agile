
-- =============================================
-- 1. AI Test Scenarios table
-- =============================================
CREATE TABLE public.ai_test_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  backlog_item_id UUID REFERENCES public.native_backlog_items(id) ON DELETE SET NULL,
  user_story TEXT NOT NULL,
  acceptance_criteria TEXT,
  generated_scenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
  scenario_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'approved', 'archived')),
  generated_by UUID NOT NULL,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_test_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view test scenarios"
  ON public.ai_test_scenarios FOR SELECT TO authenticated
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Authenticated members can create test scenarios"
  ON public.ai_test_scenarios FOR INSERT TO authenticated
  WITH CHECK (public.is_pmi_project_member(project_id) AND auth.uid() = generated_by);

CREATE POLICY "Authenticated members can update test scenarios"
  ON public.ai_test_scenarios FOR UPDATE TO authenticated
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Owners can delete test scenarios"
  ON public.ai_test_scenarios FOR DELETE TO authenticated
  USING (auth.uid() = generated_by);

CREATE TRIGGER update_ai_test_scenarios_updated_at
  BEFORE UPDATE ON public.ai_test_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Meeting Notes table (text-based, GDPR-safe)
-- =============================================
CREATE TABLE public.meeting_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'general' CHECK (meeting_type IN ('standup', 'planning', 'retro', 'review', 'general', 'stakeholder')),
  raw_notes TEXT NOT NULL,
  ai_summary TEXT,
  extracted_decisions JSONB DEFAULT '[]'::jsonb,
  extracted_action_items JSONB DEFAULT '[]'::jsonb,
  extracted_key_topics JSONB DEFAULT '[]'::jsonb,
  attendees TEXT[] DEFAULT '{}',
  meeting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view meeting notes"
  ON public.meeting_notes FOR SELECT TO authenticated
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Members can create meeting notes"
  ON public.meeting_notes FOR INSERT TO authenticated
  WITH CHECK (public.is_pmi_project_member(project_id) AND auth.uid() = created_by);

CREATE POLICY "Members can update meeting notes"
  ON public.meeting_notes FOR UPDATE TO authenticated
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Creators can delete meeting notes"
  ON public.meeting_notes FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE TRIGGER update_meeting_notes_updated_at
  BEFORE UPDATE ON public.meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. Resource Forecasts table
-- =============================================
CREATE TABLE public.resource_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  forecast_type TEXT NOT NULL DEFAULT 'capacity' CHECK (forecast_type IN ('capacity', 'allocation', 'burndown', 'staffing')),
  forecast_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sprints_ahead INTEGER NOT NULL DEFAULT 3,
  confidence_level TEXT NOT NULL DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  recommendations JSONB DEFAULT '[]'::jsonb,
  ai_analysis TEXT,
  generated_by UUID NOT NULL,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view forecasts"
  ON public.resource_forecasts FOR SELECT TO authenticated
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Members can create forecasts"
  ON public.resource_forecasts FOR INSERT TO authenticated
  WITH CHECK (public.is_pmi_project_member(project_id) AND auth.uid() = generated_by);

CREATE POLICY "Members can update forecasts"
  ON public.resource_forecasts FOR UPDATE TO authenticated
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Generators can delete forecasts"
  ON public.resource_forecasts FOR DELETE TO authenticated
  USING (auth.uid() = generated_by);

CREATE TRIGGER update_resource_forecasts_updated_at
  BEFORE UPDATE ON public.resource_forecasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 4. Smart Nudges table
-- =============================================
CREATE TABLE public.smart_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('stale_pr', 'blocked_item', 'overdue_task', 'idle_sprint', 'capacity_warning', 'review_pending', 'retro_due')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'urgent')),
  related_item_id UUID,
  related_item_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.smart_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nudges"
  ON public.smart_nudges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create nudges for project members"
  ON public.smart_nudges FOR INSERT TO authenticated
  WITH CHECK (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can update their own nudges"
  ON public.smart_nudges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nudges"
  ON public.smart_nudges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast nudge queries
CREATE INDEX idx_smart_nudges_user_unread ON public.smart_nudges (user_id, is_read, is_dismissed) WHERE is_read = false AND is_dismissed = false;
CREATE INDEX idx_smart_nudges_project ON public.smart_nudges (project_id, created_at DESC);
CREATE INDEX idx_resource_forecasts_project ON public.resource_forecasts (project_id, created_at DESC);
CREATE INDEX idx_meeting_notes_project ON public.meeting_notes (project_id, meeting_date DESC);
CREATE INDEX idx_ai_test_scenarios_project ON public.ai_test_scenarios (project_id, created_at DESC);
