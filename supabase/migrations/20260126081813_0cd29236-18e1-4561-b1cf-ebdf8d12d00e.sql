-- Properly fix the audit logging issue
-- The trigger functions need to bypass RLS when inserting audit logs

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can insert own access logs" ON sensitive_data_access_log;

-- Create proper policy - only allow users to insert their own logs
CREATE POLICY "Users can insert own access logs" 
ON sensitive_data_access_log 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Update the log_sensitive_token_access function to use SECURITY DEFINER properly
-- It needs to SET the role to bypass RLS
CREATE OR REPLACE FUNCTION public.log_sensitive_token_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if auth.uid() is available (authenticated context)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO sensitive_data_access_log (
      user_id, 
      table_accessed, 
      access_type, 
      query_context,
      ip_address
    )
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'New token stored'
        WHEN TG_OP = 'UPDATE' THEN 'Token refreshed/updated'
        WHEN TG_OP = 'DELETE' THEN 'Token revoked'
        ELSE 'Token accessed'
      END,
      COALESCE(
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'cf-connecting-ip'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if logging fails
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update log_token_access function similarly  
CREATE OR REPLACE FUNCTION public.log_token_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if auth.uid() is available
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO sensitive_data_access_log (
      user_id, 
      table_accessed, 
      access_type, 
      query_context,
      ip_address
    )
    VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'Token created'
        WHEN TG_OP = 'UPDATE' THEN 'Token updated'
        WHEN TG_OP = 'DELETE' THEN 'Token deleted'
        ELSE 'Token accessed'
      END,
      current_setting('request.headers', true)::json->>'x-forwarded-for'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if logging fails
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update log_sensitive_access function
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.sensitive_data_access_log (
      user_id,
      table_accessed,
      access_type,
      ip_address,
      query_context
    ) VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      current_setting('request.path', true)
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if logging fails
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;