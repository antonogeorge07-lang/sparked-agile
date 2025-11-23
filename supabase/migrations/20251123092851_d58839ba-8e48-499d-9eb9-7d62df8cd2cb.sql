-- Add missing foreign key relationship between integrations and projects
ALTER TABLE public.integrations
ADD CONSTRAINT integrations_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES public.projects(id) 
ON DELETE CASCADE;