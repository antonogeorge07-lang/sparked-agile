-- Auto-subscribe project creators to the daily digest
CREATE OR REPLACE FUNCTION public.auto_create_digest_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip if a subscription already exists for this user+project
  IF EXISTS (
    SELECT 1 FROM public.digest_subscriptions
    WHERE user_id = NEW.user_id AND project_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.digest_subscriptions (
    user_id, project_id, digest_type, delivery_hour,
    include_wins, include_risks, include_recommendations, include_metrics, is_active
  ) VALUES (
    NEW.user_id, NEW.id, 'daily', 8,
    true, true, true, true, true
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block project creation on digest subscription failure
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_digest_subscription ON public.projects;
CREATE TRIGGER trg_auto_digest_subscription
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_digest_subscription();

-- Backfill: subscribe every existing project owner that isn't already subscribed
INSERT INTO public.digest_subscriptions (
  user_id, project_id, digest_type, delivery_hour,
  include_wins, include_risks, include_recommendations, include_metrics, is_active
)
SELECT p.user_id, p.id, 'daily', 8, true, true, true, true, true
FROM public.projects p
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.digest_subscriptions ds
    WHERE ds.user_id = p.user_id AND ds.project_id = p.id
  );