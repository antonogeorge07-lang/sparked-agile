-- Create webhooks table for storing webhook configurations
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook delivery logs table
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhooks - users can manage their own webhooks
CREATE POLICY "Users can view their own webhooks"
ON public.webhooks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks"
ON public.webhooks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks"
ON public.webhooks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
ON public.webhooks FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for webhook deliveries
CREATE POLICY "Users can view their webhook deliveries"
ON public.webhook_deliveries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.webhooks 
  WHERE webhooks.id = webhook_deliveries.webhook_id 
  AND webhooks.user_id = auth.uid()
));

-- Create trigger function to dispatch webhooks
CREATE OR REPLACE FUNCTION public.dispatch_webhook_event()
RETURNS TRIGGER AS $$
DECLARE
  webhook_record RECORD;
  event_type TEXT;
  payload JSONB;
BEGIN
  -- Determine event type based on table and operation
  event_type := TG_TABLE_NAME || '.' || LOWER(TG_OP);
  
  -- Build payload
  IF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object(
      'event', event_type,
      'data', row_to_json(OLD),
      'timestamp', now()
    );
  ELSE
    payload := jsonb_build_object(
      'event', event_type,
      'data', row_to_json(NEW),
      'timestamp', now()
    );
  END IF;

  -- Find matching webhooks and create delivery records
  FOR webhook_record IN
    SELECT w.id, w.url, w.secret
    FROM public.webhooks w
    WHERE w.is_active = true
    AND (
      (TG_TABLE_NAME = 'projects' AND w.project_id IS NULL) OR
      (TG_TABLE_NAME != 'projects' AND (
        w.project_id = COALESCE(NEW.project_id, OLD.project_id) OR
        w.project_id IS NULL
      ))
    )
    AND event_type = ANY(w.events)
  LOOP
    INSERT INTO public.webhook_deliveries (webhook_id, event_type, payload, status)
    VALUES (webhook_record.id, event_type, payload, 'pending');
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for webhook events
CREATE TRIGGER webhook_projects_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook_event();

CREATE TRIGGER webhook_project_tasks_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.project_tasks
FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook_event();

CREATE TRIGGER webhook_epics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.epics
FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook_event();

-- Update timestamp trigger for webhooks
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();