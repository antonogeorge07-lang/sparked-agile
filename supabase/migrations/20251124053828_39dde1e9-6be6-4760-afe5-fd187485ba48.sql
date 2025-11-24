
-- Create trigger to automatically add project creator as project member
CREATE OR REPLACE FUNCTION public.add_creator_as_project_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add the project creator as a project member with 'owner' role
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on projects table
DROP TRIGGER IF EXISTS on_project_created_add_member ON public.projects;

CREATE TRIGGER on_project_created_add_member
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_project_member();

-- Also ensure existing projects have their creators as members
INSERT INTO public.project_members (project_id, user_id, role)
SELECT DISTINCT p.id, p.user_id, 'owner'
FROM public.projects p
WHERE p.user_id IS NOT NULL
ON CONFLICT (project_id, user_id) DO NOTHING;
