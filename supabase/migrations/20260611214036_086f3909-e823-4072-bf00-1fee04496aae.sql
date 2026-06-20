
-- 1. Sanitization function: removes sensitive keys from a jsonb blob
CREATE OR REPLACE FUNCTION public.sanitize_integration_config(p_config jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(p_config, '{}'::jsonb)
    - 'apiToken'
    - 'api_token'
    - 'token'
    - 'access_token'
    - 'accessToken'
    - 'refresh_token'
    - 'refreshToken'
    - 'secret'
    - 'client_secret'
    - 'clientSecret'
    - 'password'
    - 'authorization'
    - 'private_key'
    - 'privateKey'
    - 'webhook_secret'
    - 'webhookSecret';
$$;

-- 2. Trigger to enforce sanitization on every write
CREATE OR REPLACE FUNCTION public.scrub_integration_config()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.config := public.sanitize_integration_config(NEW.config);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_scrub_integration_config ON public.integrations;
CREATE TRIGGER trg_scrub_integration_config
  BEFORE INSERT OR UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.scrub_integration_config();

-- 3. Cleanup existing rows
UPDATE public.integrations
SET config = public.sanitize_integration_config(config)
WHERE config ?| ARRAY[
  'apiToken','api_token','token','access_token','accessToken',
  'refresh_token','refreshToken','secret','client_secret','clientSecret',
  'password','authorization','private_key','privateKey',
  'webhook_secret','webhookSecret'
];
