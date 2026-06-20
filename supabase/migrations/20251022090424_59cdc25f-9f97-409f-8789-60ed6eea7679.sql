-- Drop unused security definer views that could expose data
-- These views are not used in the application and lack proper RLS policies

DROP VIEW IF EXISTS public.safe_ai_usage_logs;
DROP VIEW IF EXISTS public.safe_integrations;
DROP VIEW IF EXISTS public.safe_team_members;

-- The underlying tables (ai_usage_logs, integrations, team_members) 
-- already have proper RLS policies in place and should be accessed directly