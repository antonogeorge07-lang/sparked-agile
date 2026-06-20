-- 1) Restore base Data API privileges (all were missing, breaking every feature).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT c.relname AS table_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'r'
           AND n.nspname = 'public'
    LOOP
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.table_name);
        EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.table_name);
    END LOOP;

    FOR tbl IN
        SELECT c.relname AS view_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'v'
           AND n.nspname = 'public'
    LOOP
        EXECUTE format('GRANT SELECT ON public.%I TO authenticated', tbl.view_name);
        EXECUTE format('GRANT SELECT ON public.%I TO service_role', tbl.view_name);
    END LOOP;
END;
$$;

-- 2) Public visitors may only read approved landing-page feedback (matches its RLS policy).
GRANT SELECT ON public.landing_feedback TO anon;

-- 3) Auto-create a personal workspace on signup so project creation never dead-ends.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  free_tier_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member'::app_role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::app_role);

  -- Auto-assign Free tier subscription
  SELECT id INTO free_tier_id FROM public.subscription_tiers WHERE name = 'Free' LIMIT 1;
  IF free_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, tier_id, status, current_period_start, current_period_end)
    VALUES (NEW.id, free_tier_id, 'active', now(), now() + INTERVAL '100 years')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Auto-create a personal workspace so the user can create projects immediately
  IF NOT EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = NEW.id) THEN
    INSERT INTO public.workspaces (name, owner_id)
    VALUES ('My Workspace', NEW.id);
  END IF;

  RETURN NEW;
END;
$function$;