CREATE OR REPLACE FUNCTION public.calculate_epic_health_score(epic_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  epic_record RECORD;
  completion_rate NUMERIC;
  time_elapsed NUMERIC;
  time_remaining NUMERIC;
  schedule_variance NUMERIC;
  missed_milestones INTEGER;
  result_health_score TEXT;
BEGIN
  SELECT 
    e.*,
    COUNT(f.id) FILTER (WHERE f.status = 'completed') as completed_features,
    COUNT(f.id) as total_features,
    COUNT(m.id) FILTER (WHERE m.status = 'missed') as missed_milestone_count
  INTO epic_record
  FROM epics e
  LEFT JOIN features f ON f.epic_id = e.id
  LEFT JOIN epic_milestones m ON m.epic_id = e.id
  WHERE e.id = epic_id_param
  GROUP BY e.id;

  IF NOT FOUND THEN
    RETURN 'on_track';
  END IF;

  IF epic_record.total_features > 0 THEN
    completion_rate := epic_record.completed_features::NUMERIC / epic_record.total_features;
  ELSE
    completion_rate := 0;
  END IF;

  IF epic_record.start_date IS NOT NULL AND epic_record.end_date IS NOT NULL THEN
    time_elapsed := (CURRENT_DATE - epic_record.start_date)::NUMERIC;
    time_remaining := (epic_record.end_date - CURRENT_DATE)::NUMERIC;
    
    IF (time_elapsed + time_remaining) > 0 THEN
      schedule_variance := completion_rate - (time_elapsed / (time_elapsed + time_remaining));
    ELSE
      schedule_variance := 0;
    END IF;
  ELSE
    schedule_variance := 0;
    time_remaining := 999;
  END IF;

  missed_milestones := COALESCE(epic_record.missed_milestone_count, 0);

  IF schedule_variance < -0.2 OR missed_milestones >= 2 OR time_remaining < 0 THEN
    result_health_score := 'critical';
  ELSIF schedule_variance < -0.1 OR missed_milestones >= 1 OR (time_remaining < 7 AND completion_rate < 0.8) THEN
    result_health_score := 'at_risk';
  ELSE
    result_health_score := 'on_track';
  END IF;

  UPDATE epics 
  SET health_score = result_health_score, 
      last_health_check = now()
  WHERE id = epic_id_param;

  RETURN result_health_score;
END;
$function$;