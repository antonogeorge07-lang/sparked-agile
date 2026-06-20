
-- 1. Add epic_id to native_backlog_items for Sprint ↔ Epic linking
ALTER TABLE public.native_backlog_items 
ADD COLUMN IF NOT EXISTS epic_id UUID REFERENCES public.epics(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_native_backlog_items_epic_id 
ON public.native_backlog_items(epic_id);

-- 2. Create trigger for automated progress snapshots on feature status change
CREATE OR REPLACE FUNCTION public.auto_create_epic_progress_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Create a progress snapshot for the epic
    IF NEW.epic_id IS NOT NULL THEN
      PERFORM create_epic_progress_snapshot(NEW.epic_id);
      -- Also recalculate health score
      PERFORM calculate_epic_health_score(NEW.epic_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_auto_epic_snapshot
  AFTER UPDATE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_epic_progress_snapshot();

-- 3. Create trigger for health drift notifications
CREATE OR REPLACE FUNCTION public.notify_epic_health_drift()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger when health_score changes
  IF OLD.health_score IS DISTINCT FROM NEW.health_score THEN
    -- Insert a notification for the epic creator and stakeholders
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      COALESCE(es.user_id, NEW.created_by),
      'Epic Health Changed: ' || NEW.title,
      'Health changed from ' || COALESCE(OLD.health_score, 'unknown') || ' to ' || NEW.health_score,
      CASE NEW.health_score 
        WHEN 'critical' THEN 'error'
        WHEN 'at_risk' THEN 'warning'
        ELSE 'info'
      END,
      '/epic/' || NEW.id
    FROM (
      SELECT user_id FROM epic_stakeholders WHERE epic_id = NEW.id
      UNION
      SELECT NEW.created_by WHERE NEW.created_by IS NOT NULL
    ) es
    WHERE es.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- Check if notifications table exists, create if not
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE TRIGGER trigger_epic_health_drift_notification
  AFTER UPDATE ON public.epics
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_epic_health_drift();

-- 4. Add unique constraint for snapshot dedup (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'epic_progress_snapshots_epic_id_snapshot_date_key'
  ) THEN
    ALTER TABLE public.epic_progress_snapshots 
    ADD CONSTRAINT epic_progress_snapshots_epic_id_snapshot_date_key 
    UNIQUE (epic_id, snapshot_date);
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;
