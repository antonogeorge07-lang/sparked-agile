-- Fix SECURITY DEFINER functions to include SET search_path parameter
-- This prevents search_path hijacking attacks where attackers could create
-- malicious schemas and tables that shadow legitimate ones

-- 1. check_user_role
CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = check_user_role.user_id
      AND user_roles.role = required_role
  );
$$;

-- 2. is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT check_user_role(user_id, 'admin'::app_role);
$$;

-- 3. is_pending_user
CREATE OR REPLACE FUNCTION public.is_pending_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT check_user_role(user_id, 'pending'::app_role);
$$;

-- 4. is_approved_user
CREATE OR REPLACE FUNCTION public.is_approved_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_approved_user.user_id
      AND user_roles.role IN ('admin'::app_role, 'member'::app_role)
  );
$$;

-- 5. get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = get_user_role.user_id LIMIT 1;
$$;

-- 6. approve_user
CREATE OR REPLACE FUNCTION public.approve_user(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;

  -- Update user role to 'user'
  UPDATE profiles
  SET role = 'user'::app_role,
      updated_at = now()
  WHERE id = user_id_param;
END;
$$;

-- 7. get_safe_integration_info
CREATE OR REPLACE FUNCTION public.get_safe_integration_info(integration_id uuid)
RETURNS TABLE(id uuid, project_id uuid, integration_type text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT 
    id,
    project_id,
    integration_type,
    is_active,
    created_at,
    updated_at
  FROM public.integrations
  WHERE id = integration_id;
$$;

-- 8. get_public_user_stats
CREATE OR REPLACE FUNCTION public.get_public_user_stats()
RETURNS TABLE(total_users integer, recent_signups integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_users,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::integer as recent_signups
  FROM profiles;
END;
$$;

-- 9. can_create_project
CREATE OR REPLACE FUNCTION public.can_create_project(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  user_project_count integer;
  user_project_limit integer;
BEGIN
  -- Count user's current projects
  SELECT COUNT(*) INTO user_project_count
  FROM projects p
  JOIN project_members pm ON p.id = pm.project_id
  WHERE pm.user_id = user_id_param;
  
  -- Get user's subscription tier limit (default to Free tier if no subscription)
  SELECT COALESCE(
    (SELECT st.project_limit 
     FROM user_subscriptions us
     JOIN subscription_tiers st ON us.tier_id = st.id
     WHERE us.user_id = user_id_param 
     AND us.status IN ('active', 'trialing')
     LIMIT 1),
    (SELECT project_limit FROM subscription_tiers WHERE name = 'Free' LIMIT 1)
  ) INTO user_project_limit;
  
  RETURN user_project_count < user_project_limit;
END;
$$;

-- 10. get_project_limit_info
CREATE OR REPLACE FUNCTION public.get_project_limit_info(user_id_param uuid)
RETURNS TABLE(current_count integer, limit_count integer, can_create boolean, tier_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer
     FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = user_id_param) as current_count,
    COALESCE(
      (SELECT st.project_limit 
       FROM user_subscriptions us
       JOIN subscription_tiers st ON us.tier_id = st.id
       WHERE us.user_id = user_id_param 
       AND us.status IN ('active', 'trialing')
       LIMIT 1),
      (SELECT project_limit FROM subscription_tiers WHERE name = 'Free' LIMIT 1)
    ) as limit_count,
    can_create_project(user_id_param) as can_create,
    COALESCE(
      (SELECT st.name 
       FROM user_subscriptions us
       JOIN subscription_tiers st ON us.tier_id = st.id
       WHERE us.user_id = user_id_param 
       AND us.status IN ('active', 'trialing')
       LIMIT 1),
      'Free'
    ) as tier_name;
END;
$$;

-- 11. check_integration_status
CREATE OR REPLACE FUNCTION public.check_integration_status(integration_id uuid)
RETURNS TABLE(id uuid, integration_type text, is_active boolean, last_tested timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT 
    integrations.id,
    integrations.integration_type,
    integrations.is_active,
    integrations.updated_at as last_tested
  FROM public.integrations
  WHERE integrations.id = integration_id
  AND EXISTS (
    SELECT 1 FROM project_members
    WHERE project_members.project_id = integrations.project_id
    AND project_members.user_id = auth.uid()
  );
$$;

-- 12. toggle_integration_status
CREATE OR REPLACE FUNCTION public.toggle_integration_status(integration_id uuid, new_status boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  is_authorized boolean;
BEGIN
  -- Check if user is project member or admin
  SELECT EXISTS (
    SELECT 1 
    FROM integrations i
    JOIN project_members pm ON pm.project_id = i.project_id
    WHERE i.id = integration_id
    AND (pm.user_id = auth.uid() OR is_admin(auth.uid()))
  ) INTO is_authorized;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE integrations
  SET 
    is_active = new_status,
    updated_at = now()
  WHERE id = integration_id;
  
  RETURN TRUE;
END;
$$;

-- 13. sync_profile_role
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Update profile role to match user_roles when user_roles changes
  UPDATE public.profiles
  SET role = NEW.role, updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- 14. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  free_tier_id uuid;
  user_email text;
  user_first_name text;
BEGIN
  -- Create profile for new user with 'member' role (auto-approved)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member'::app_role
  );

  -- Get the Free tier ID
  SELECT id INTO free_tier_id
  FROM subscription_tiers
  WHERE name = 'Free'
  LIMIT 1;

  -- Auto-assign Free tier subscription to new user
  IF free_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, tier_id, status)
    VALUES (NEW.id, free_tier_id, 'active');
  END IF;

  -- Create user_role entry for the new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::app_role);

  -- Send welcome email asynchronously (don't block signup if this fails)
  BEGIN
    user_email := NEW.email;
    user_first_name := NEW.raw_user_meta_data->>'first_name';
    
    PERFORM
      net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-welcome-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'email', user_email,
          'firstName', COALESCE(user_first_name, '')
        )
      );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block user signup if email fails
      RAISE WARNING 'Failed to send welcome email to %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$;