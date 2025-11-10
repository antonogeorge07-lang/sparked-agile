-- Create a function to send welcome email when a new user signs up
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_first_name text;
BEGIN
  -- Get user email and first name from the new user record
  user_email := NEW.email;
  user_first_name := NEW.raw_user_meta_data->>'first_name';
  
  -- Call the edge function to send the welcome email
  -- Using pg_net extension to make HTTP request
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
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user signup if email fails
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically send welcome email on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();

-- Add comment for documentation
COMMENT ON FUNCTION public.send_welcome_email_on_signup() IS 'Automatically sends a welcome email to new users upon signup with helpful resources and next steps';
