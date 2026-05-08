
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referrer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referrer_id ON public.profiles(referrer_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_featured ON public.workspaces(featured) WHERE featured = true;

CREATE OR REPLACE FUNCTION public.get_featured_workspaces()
RETURNS TABLE(name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.name
  FROM public.workspaces w
  WHERE w.featured = true
  ORDER BY w.created_at DESC
  LIMIT 24;
$$;

GRANT EXECUTE ON FUNCTION public.get_featured_workspaces() TO anon, authenticated;
