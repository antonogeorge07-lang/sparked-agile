
-- =========================================================
-- delivery_signals: daily snapshots of real delivery data
-- =========================================================
CREATE TABLE public.delivery_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL CHECK (source IN ('github', 'jira', 'combined')),
  prs_merged INTEGER NOT NULL DEFAULT 0,
  prs_opened INTEGER NOT NULL DEFAULT 0,
  issues_resolved INTEGER NOT NULL DEFAULT 0,
  issues_opened INTEGER NOT NULL DEFAULT 0,
  cycle_time_p50_hours NUMERIC(10,2),
  cycle_time_p90_hours NUMERIC(10,2),
  lead_time_p50_hours NUMERIC(10,2),
  wip_count INTEGER NOT NULL DEFAULT 0,
  blocked_count INTEGER NOT NULL DEFAULT 0,
  deploy_count INTEGER NOT NULL DEFAULT 0,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, snapshot_date, source)
);

CREATE INDEX idx_delivery_signals_workspace_date
  ON public.delivery_signals (workspace_id, snapshot_date DESC);

GRANT SELECT ON public.delivery_signals TO authenticated;
GRANT ALL ON public.delivery_signals TO service_role;

ALTER TABLE public.delivery_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view delivery signals"
  ON public.delivery_signals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = delivery_signals.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Inserts/updates done only by service role (ingestion function).

-- =========================================================
-- business_value_tags: value tagging for epics/features
-- =========================================================
CREATE TABLE public.business_value_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('epic', 'feature')),
  entity_id UUID NOT NULL,
  value_band TEXT NOT NULL CHECK (value_band IN ('high', 'medium', 'low')),
  value_type TEXT NOT NULL CHECK (value_type IN ('revenue', 'cost_saving', 'risk_reduction', 'customer', 'compliance')),
  estimated_amount NUMERIC(14,2),
  currency TEXT DEFAULT 'GBP',
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
  notes TEXT,
  tagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

CREATE INDEX idx_business_value_tags_workspace
  ON public.business_value_tags (workspace_id);
CREATE INDEX idx_business_value_tags_entity
  ON public.business_value_tags (entity_type, entity_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_value_tags TO authenticated;
GRANT ALL ON public.business_value_tags TO service_role;

ALTER TABLE public.business_value_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members view value tags"
  ON public.business_value_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = business_value_tags.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members create value tags"
  ON public.business_value_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    tagged_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = business_value_tags.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members update value tags"
  ON public.business_value_tags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = business_value_tags.workspace_id
        AND wm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = business_value_tags.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Tagger or workspace admins delete value tags"
  ON public.business_value_tags FOR DELETE
  TO authenticated
  USING (
    tagged_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = business_value_tags.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- =========================================================
-- updated_at triggers
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_delivery_signals_updated_at
  BEFORE UPDATE ON public.delivery_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_business_value_tags_updated_at
  BEFORE UPDATE ON public.business_value_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
