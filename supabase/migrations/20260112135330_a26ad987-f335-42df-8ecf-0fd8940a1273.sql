-- Fix the trigger - PostgreSQL triggers can't fire on SELECT
-- Create trigger on INSERT/UPDATE/DELETE only
DROP TRIGGER IF EXISTS log_microsoft_token_access ON public.user_microsoft_tokens;
CREATE TRIGGER log_microsoft_token_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_microsoft_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.log_token_access();