-- Fix the dispatch_webhook_event function to handle tables without project_id
CREATE OR REPLACE FUNCTION public.dispatch_webhook_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  webhook_record RECORD;
  event_type TEXT;
  payload JSONB;
  record_project_id UUID;
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

  -- Safely extract project_id if the column exists
  BEGIN
    IF TG_OP = 'DELETE' THEN
      EXECUTE format('SELECT ($1).project_id') INTO record_project_id USING OLD;
    ELSE
      EXECUTE format('SELECT ($1).project_id') INTO record_project_id USING NEW;
    END IF;
  EXCEPTION WHEN undefined_column THEN
    record_project_id := NULL;
  END;

  -- Find matching webhooks and create delivery records
  FOR webhook_record IN
    SELECT w.id, w.url, w.secret
    FROM public.webhooks w
    WHERE w.is_active = true
    AND (
      (TG_TABLE_NAME = 'projects' AND w.project_id IS NULL) OR
      (TG_TABLE_NAME != 'projects' AND (
        w.project_id = record_project_id OR
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
$function$;