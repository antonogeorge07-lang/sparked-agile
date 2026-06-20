-- Remove visitor_tracking table entirely (marked for removal per project memory)
-- This table has an overly permissive RLS policy exposing device fingerprints and browsing behavior

DROP TABLE IF EXISTS public.visitor_tracking CASCADE;