
CREATE OR REPLACE FUNCTION public.add_creator_as_project_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

INSERT INTO public.project_members (project_id, user_id, role)
SELECT p.id, p.user_id, 'owner'
FROM public.projects p
WHERE p.user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.project_members pm
  WHERE pm.project_id = p.id AND pm.user_id = p.user_id
)
ON CONFLICT (project_id, user_id) DO NOTHING;
