-- Drop the trigger on auth.users (we shouldn't attach triggers to reserved schemas)
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
DROP FUNCTION IF EXISTS public.send_welcome_email_on_signup();

-- Update the existing handle_new_user function to also send welcome emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile, assigns free tier, and sends welcome email on signup';
