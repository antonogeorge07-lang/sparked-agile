-- Fix function search path for sanitize_webhook_payload
CREATE OR REPLACE FUNCTION public.sanitize_webhook_payload(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  sanitized JSONB;
BEGIN
  sanitized := payload;
  sanitized := sanitized - ARRAY['password', 'token', 'secret', 'api_key', 'credentials', 
    'access_token', 'refresh_token', 'private_key', 'authorization'];
  RETURN sanitized;
END;
$$;

-- Fix function search path for hash_ip_address
CREATE OR REPLACE FUNCTION public.hash_ip_address(ip TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = 'public', 'pg_catalog'
AS $$
  SELECT encode(sha256(COALESCE(ip, '')::bytea), 'hex');
$$;