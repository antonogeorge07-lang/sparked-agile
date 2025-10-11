-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'pending');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.app_role DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create project_members table for allocation
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Add user_id to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pending'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Update RLS policies for projects
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public insert to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public update to projects" ON public.projects;

CREATE POLICY "Users can view allocated projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Approved users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'member')
    AND auth.uid() = user_id
  );

CREATE POLICY "Project owners can update their projects"
  ON public.projects FOR UPDATE
  USING (user_id = auth.uid());

-- Update RLS policies for project_members
CREATE POLICY "Users can view their project memberships"
  ON public.project_members FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Project owners can manage members"
  ON public.project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    ) OR public.is_admin(auth.uid())
  );

-- Update RLS policies for team_members
DROP POLICY IF EXISTS "Allow public read access to team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public insert to team_members" ON public.team_members;

CREATE POLICY "Users can view team members of allocated projects"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = team_members.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage team members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = team_members.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Update RLS policies for standup_updates
DROP POLICY IF EXISTS "Allow public read access to standup_updates" ON public.standup_updates;
DROP POLICY IF EXISTS "Allow public insert to standup_updates" ON public.standup_updates;

CREATE POLICY "Users can view standups of allocated projects"
  ON public.standup_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = standup_updates.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create standups"
  ON public.standup_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = standup_updates.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Update RLS policies for action_items
DROP POLICY IF EXISTS "Allow public read access to action_items" ON public.action_items;
DROP POLICY IF EXISTS "Allow public insert to action_items" ON public.action_items;
DROP POLICY IF EXISTS "Allow public update to action_items" ON public.action_items;

CREATE POLICY "Users can view action items of allocated projects"
  ON public.action_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = action_items.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage action items"
  ON public.action_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = action_items.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Update RLS policies for sprint_summaries
DROP POLICY IF EXISTS "Allow public read access to sprint_summaries" ON public.sprint_summaries;
DROP POLICY IF EXISTS "Allow public insert to sprint_summaries" ON public.sprint_summaries;

CREATE POLICY "Users can view sprint summaries of allocated projects"
  ON public.sprint_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = sprint_summaries.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create sprint summaries"
  ON public.sprint_summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = sprint_summaries.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Update RLS policies for workflow_executions
DROP POLICY IF EXISTS "Allow public read access to workflow_executions" ON public.workflow_executions;
DROP POLICY IF EXISTS "Allow public insert to workflow_executions" ON public.workflow_executions;
DROP POLICY IF EXISTS "Allow public update to workflow_executions" ON public.workflow_executions;

CREATE POLICY "Users can view workflow executions of allocated projects"
  ON public.workflow_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = workflow_executions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage workflow executions"
  ON public.workflow_executions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = workflow_executions.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);