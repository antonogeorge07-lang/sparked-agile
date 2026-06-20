-- Create integration cache table for caching API responses
CREATE TABLE public.integration_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  cache_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, integration_type, cache_key)
);

-- Enable RLS
ALTER TABLE public.integration_cache ENABLE ROW LEVEL SECURITY;

-- Project members can manage their project's cache
CREATE POLICY "Project members can manage integration cache"
ON public.integration_cache
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = integration_cache.project_id
    AND project_members.user_id = auth.uid()
  )
);

-- Create integration_events table for webhook events
CREATE TABLE public.integration_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;

-- Project members can view events
CREATE POLICY "Project members can view integration events"
ON public.integration_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = integration_events.project_id
    AND project_members.user_id = auth.uid()
  )
);

-- Enable realtime for integration_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.integration_events;

-- Index for cache lookups
CREATE INDEX idx_integration_cache_lookup ON public.integration_cache(project_id, integration_type, cache_key);
CREATE INDEX idx_integration_cache_expiry ON public.integration_cache(expires_at);

-- Index for events
CREATE INDEX idx_integration_events_project ON public.integration_events(project_id, integration_type);
CREATE INDEX idx_integration_events_created ON public.integration_events(created_at DESC);