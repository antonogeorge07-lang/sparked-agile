-- 1) Add platform_owner role and seed it; replace hardcoded email check
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'platform_owner';
