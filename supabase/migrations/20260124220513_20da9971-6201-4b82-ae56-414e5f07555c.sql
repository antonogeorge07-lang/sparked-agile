-- =============================================
-- STAKEHOLDER PORTAL FOUNDATION - Part 1
-- Tables without enum reference in functions
-- =============================================

-- 1. Stakeholder Dashboard Widget Configurations
CREATE TABLE IF NOT EXISTS public.stakeholder_widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('velocity_trend', 'epic_roi', 'milestone_tracker', 'risk_heatmap', 'sprint_progress', 'team_velocity', 'blockers_summary', 'completion_rate')),
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stakeholder_widget_configs ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only manage their own widget configs
CREATE POLICY "Users manage own widget configs"
  ON public.stakeholder_widget_configs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Approval Requests Table (for stakeholder approvals)
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  epic_id UUID REFERENCES public.epics(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  approver_id UUID REFERENCES auth.users(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('epic_closure', 'budget_change', 'milestone_change', 'scope_change', 'resource_request')),
  title TEXT NOT NULL,
  description TEXT,
  current_value JSONB,
  proposed_value JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Requesters can view their own requests, approvers can view requests assigned to them
CREATE POLICY "Users view relevant approval requests"
  ON public.approval_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id 
    OR auth.uid() = approver_id
    OR EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = approval_requests.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );

-- RLS: Only requesters can create requests
CREATE POLICY "Users create own approval requests"
  ON public.approval_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- RLS: Approvers can update (approve/reject) requests assigned to them
CREATE POLICY "Approvers can update assigned requests"
  ON public.approval_requests
  FOR UPDATE
  USING (
    auth.uid() = approver_id
    OR auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = approval_requests.project_id 
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'admin')
    )
  );

-- 3. Executive Digest Subscriptions
CREATE TABLE IF NOT EXISTS public.digest_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  digest_type TEXT NOT NULL DEFAULT 'weekly' CHECK (digest_type IN ('daily', 'weekly', 'monthly')),
  delivery_day INTEGER CHECK (delivery_day >= 0 AND delivery_day <= 6),
  delivery_hour INTEGER DEFAULT 9 CHECK (delivery_hour >= 0 AND delivery_hour <= 23),
  include_wins BOOLEAN DEFAULT true,
  include_risks BOOLEAN DEFAULT true,
  include_recommendations BOOLEAN DEFAULT true,
  include_metrics BOOLEAN DEFAULT true,
  email_address TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id, digest_type)
);

-- Enable RLS
ALTER TABLE public.digest_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: Users manage only their own subscriptions
CREATE POLICY "Users manage own digest subscriptions"
  ON public.digest_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Digest History (for tracking sent digests)
CREATE TABLE IF NOT EXISTS public.digest_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.digest_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  digest_content JSONB NOT NULL,
  ai_summary TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'bounced'))
);

-- Enable RLS
ALTER TABLE public.digest_history ENABLE ROW LEVEL SECURITY;

-- RLS: Users view only their own digest history
CREATE POLICY "Users view own digest history"
  ON public.digest_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Stakeholder Alerts Configuration
CREATE TABLE IF NOT EXISTS public.stakeholder_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('milestone_slip', 'roi_threshold', 'risk_escalation', 'budget_overrun', 'velocity_drop', 'blocker_critical')),
  threshold_value NUMERIC,
  threshold_operator TEXT CHECK (threshold_operator IN ('gt', 'lt', 'eq', 'gte', 'lte')),
  is_active BOOLEAN DEFAULT true,
  notify_email BOOLEAN DEFAULT true,
  notify_teams BOOLEAN DEFAULT false,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stakeholder_alerts ENABLE ROW LEVEL SECURITY;

-- RLS: Users manage only their own alerts
CREATE POLICY "Users manage own alerts"
  ON public.stakeholder_alerts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Update triggers for timestamps
CREATE TRIGGER update_stakeholder_widget_configs_updated_at
  BEFORE UPDATE ON public.stakeholder_widget_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_digest_subscriptions_updated_at
  BEFORE UPDATE ON public.digest_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Function to check stakeholder access (using text role comparison)
CREATE OR REPLACE FUNCTION public.is_project_stakeholder(p_user_id UUID, p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.user_id = p_user_id
    AND pm.project_id = p_project_id
    AND pm.role IN ('owner', 'admin', 'stakeholder')
  );
$$;

-- 8. Function to get pending approvals count
CREATE OR REPLACE FUNCTION public.get_pending_approvals_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.approval_requests
  WHERE approver_id = p_user_id
  AND status = 'pending';
$$;