-- Fix search_path for security functions - drop trigger first
DROP TRIGGER IF EXISTS update_milestone_status_trigger ON public.epic_milestones;
DROP FUNCTION IF EXISTS public.update_milestone_status();

CREATE OR REPLACE FUNCTION public.update_milestone_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  -- Auto-update status to missed if past target date and not completed
  IF NEW.completion_date IS NULL 
     AND NEW.target_date < CURRENT_DATE 
     AND NEW.status NOT IN ('completed', 'missed') THEN
    NEW.status := 'missed';
  END IF;

  -- Auto-update status to completed if completion_date is set
  IF NEW.completion_date IS NOT NULL AND NEW.status != 'completed' THEN
    NEW.status := 'completed';
    NEW.completion_percentage := 100;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_milestone_status_trigger
BEFORE INSERT OR UPDATE ON public.epic_milestones
FOR EACH ROW
EXECUTE FUNCTION update_milestone_status();