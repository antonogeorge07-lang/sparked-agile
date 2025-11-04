-- Update handle_new_user function to approve users automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  free_tier_id uuid;
BEGIN
  -- Create profile for new user with 'member' role (auto-approved)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member'::app_role  -- Changed from 'pending' to 'member'
  );

  -- Get the Free tier ID
  SELECT id INTO free_tier_id
  FROM subscription_tiers
  WHERE name = 'Free'
  LIMIT 1;

  -- Auto-assign Free tier subscription to new user
  IF free_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (user_id, tier_id, status)
    VALUES (NEW.id, free_tier_id, 'active');  -- Changed from 'trial' to 'active'
  END IF;

  -- Create user_role entry for the new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::app_role);

  RETURN NEW;
END;
$function$;