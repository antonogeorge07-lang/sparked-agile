UPDATE public.integrations
SET config = config
  || jsonb_build_object(
       'repo_name', (config->>'organization') || '/' || (config->>'repository'),
       'repo_url',  'https://github.com/' || (config->>'organization') || '/' || (config->>'repository')
     )
WHERE integration_type = 'github'
  AND config ? 'organization'
  AND config ? 'repository'
  AND NOT (config ? 'repo_url');