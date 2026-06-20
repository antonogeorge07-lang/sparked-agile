
-- 1. Dedupe: keep newest row per (project_id, integration_type), delete the rest
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, integration_type
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) AS rn
  FROM public.integrations
)
DELETE FROM public.integrations i
USING ranked r
WHERE i.id = r.id AND r.rn > 1;

-- 2. Deactivate orphan Jira integrations (no valid user token exists anywhere)
UPDATE public.integrations i
SET is_active = false, updated_at = now()
WHERE i.integration_type = 'jira'
  AND i.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_jira_tokens t
    WHERE t.is_valid = true
  );

-- 3. Deactivate orphan GitHub integrations (no valid user token)
UPDATE public.integrations i
SET is_active = false, updated_at = now()
WHERE i.integration_type = 'github'
  AND i.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_github_tokens t
    WHERE t.is_valid = true
  );

-- 4. Unique constraint: one row per (project_id, integration_type)
CREATE UNIQUE INDEX IF NOT EXISTS integrations_project_type_uniq
  ON public.integrations (project_id, integration_type);

-- 5. Reconciler function & triggers: when a token is deleted or invalidated,
--    automatically deactivate matching integrations so the UI reflects reality.
CREATE OR REPLACE FUNCTION public.deactivate_orphan_integrations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type TEXT;
  v_still_valid BOOLEAN;
BEGIN
  -- Determine integration type from triggering table
  IF TG_TABLE_NAME = 'user_jira_tokens' THEN
    v_type := 'jira';
  ELSIF TG_TABLE_NAME = 'user_github_tokens' THEN
    v_type := 'github';
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Are there ANY valid tokens of this type remaining?
  IF v_type = 'jira' THEN
    SELECT EXISTS(SELECT 1 FROM public.user_jira_tokens WHERE is_valid = true) INTO v_still_valid;
  ELSE
    SELECT EXISTS(SELECT 1 FROM public.user_github_tokens WHERE is_valid = true) INTO v_still_valid;
  END IF;

  IF NOT v_still_valid THEN
    UPDATE public.integrations
    SET is_active = false, updated_at = now()
    WHERE integration_type = v_type AND is_active = true;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_jira_token_reconcile ON public.user_jira_tokens;
CREATE TRIGGER trg_jira_token_reconcile
AFTER DELETE OR UPDATE OF is_valid ON public.user_jira_tokens
FOR EACH ROW EXECUTE FUNCTION public.deactivate_orphan_integrations();

DROP TRIGGER IF EXISTS trg_github_token_reconcile ON public.user_github_tokens;
CREATE TRIGGER trg_github_token_reconcile
AFTER DELETE OR UPDATE OF is_valid ON public.user_github_tokens
FOR EACH ROW EXECUTE FUNCTION public.deactivate_orphan_integrations();
