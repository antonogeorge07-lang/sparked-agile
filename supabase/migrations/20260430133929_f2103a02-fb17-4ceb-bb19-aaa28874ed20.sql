-- Phase D: Consolidate to integrations table
-- Drop legacy project_workspaces and ceremony_configs (both unused/dropped functionality)
DROP TABLE IF EXISTS public.ceremony_configs CASCADE;
DROP TABLE IF EXISTS public.project_workspaces CASCADE;