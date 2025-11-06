-- Add missing fields to pmi_tasks table
ALTER TABLE pmi_tasks
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS dependencies text[],
ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Update status check constraint to include new statuses
ALTER TABLE pmi_tasks DROP CONSTRAINT IF EXISTS pmi_tasks_status_check;
ALTER TABLE pmi_tasks ADD CONSTRAINT pmi_tasks_status_check 
CHECK (status IN ('Not Started', 'In-Progress', 'Completed', 'Deferred', 'Spillover', 'To-Do'));

-- Create risk_register table
CREATE TABLE IF NOT EXISTS risk_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES pmi_projects(id) ON DELETE CASCADE,
  risk_title text NOT NULL,
  description text,
  category text DEFAULT 'Technical',
  probability text DEFAULT 'Medium' CHECK (probability IN ('Low', 'Medium', 'High')),
  impact text DEFAULT 'Medium' CHECK (impact IN ('Low', 'Medium', 'High')),
  mitigation_strategy text,
  owner text,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Mitigated', 'Accepted', 'Closed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create lessons_learned table
CREATE TABLE IF NOT EXISTS lessons_learned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES pmi_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'Process' CHECK (category IN ('Process', 'Technical', 'Communication', 'Resource', 'Other')),
  impact text DEFAULT 'Medium' CHECK (impact IN ('Low', 'Medium', 'High')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES pmi_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date NOT NULL,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Delayed')),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create project_budget table
CREATE TABLE IF NOT EXISTS project_budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES pmi_projects(id) ON DELETE CASCADE,
  budget_allocated numeric NOT NULL DEFAULT 0,
  budget_spent numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  last_updated timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budget ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_register
CREATE POLICY "Users can view risks in their projects"
ON risk_register FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = risk_register.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage risks in their projects"
ON risk_register FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = risk_register.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- RLS Policies for lessons_learned
CREATE POLICY "Users can view lessons in their projects"
ON lessons_learned FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = lessons_learned.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create lessons in their projects"
ON lessons_learned FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = lessons_learned.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- RLS Policies for project_milestones
CREATE POLICY "Users can view milestones in their projects"
ON project_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_milestones.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage milestones in their projects"
ON project_milestones FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_milestones.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- RLS Policies for project_budget
CREATE POLICY "Users can view budget in their projects"
ON project_budget FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_budget.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage budget in their projects"
ON project_budget FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pmi_projects
    WHERE pmi_projects.id = project_budget.project_id
    AND pmi_projects.user_id = auth.uid()
  )
);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_register_updated_at
BEFORE UPDATE ON risk_register
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
BEFORE UPDATE ON project_milestones
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();