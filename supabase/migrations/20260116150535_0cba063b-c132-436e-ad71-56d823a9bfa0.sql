-- =====================================================
-- NATIVE PM ECOSYSTEM - Self-contained boards, sprints, 
-- issue tracking with AI Co-Pilot capabilities
-- =====================================================

-- 1. Native Sprints Table
CREATE TABLE public.native_sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  velocity_committed INTEGER DEFAULT 0,
  velocity_completed INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Native Backlog Items Table (enhanced issues/tickets)
CREATE TABLE public.native_backlog_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.native_sprints(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.native_backlog_items(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL DEFAULT 'story' CHECK (item_type IN ('epic', 'story', 'task', 'bug', 'subtask')),
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'in_review', 'testing', 'done', 'closed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  story_points INTEGER,
  assignee_id UUID REFERENCES auth.users(id),
  reporter_id UUID REFERENCES auth.users(id),
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  labels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Board Columns (customizable swimlanes)
CREATE TABLE public.board_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  wip_limit INTEGER,
  color TEXT,
  is_done_column BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Item Comments
CREATE TABLE public.item_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.native_backlog_items(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Item Attachments
CREATE TABLE public.item_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.native_backlog_items(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. AI Suggestions Table (for AI Co-Pilot)
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.native_backlog_items(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.native_sprints(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
    'task_assignment', 'priority_change', 'story_points', 'blocker_detection',
    'sprint_capacity', 'user_story_generation', 'acceptance_criteria', 
    'risk_prediction', 'velocity_forecast', 'workload_balance'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Sprint Burndown Snapshots
CREATE TABLE public.sprint_burndown (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sprint_id UUID NOT NULL REFERENCES public.native_sprints(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  remaining_points INTEGER NOT NULL DEFAULT 0,
  completed_points INTEGER NOT NULL DEFAULT 0,
  added_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sprint_id, snapshot_date)
);

-- 8. Activity Log (for tracking all changes)
CREATE TABLE public.item_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.native_backlog_items(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'created', 'updated', 'status_changed', 'assigned', 'commented',
    'attached', 'moved_to_sprint', 'points_changed', 'priority_changed'
  )),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_native_sprints_project ON public.native_sprints(project_id);
CREATE INDEX idx_native_sprints_status ON public.native_sprints(status);
CREATE INDEX idx_backlog_items_project ON public.native_backlog_items(project_id);
CREATE INDEX idx_backlog_items_sprint ON public.native_backlog_items(sprint_id);
CREATE INDEX idx_backlog_items_assignee ON public.native_backlog_items(assignee_id);
CREATE INDEX idx_backlog_items_status ON public.native_backlog_items(status);
CREATE INDEX idx_item_comments_item ON public.item_comments(item_id);
CREATE INDEX idx_ai_suggestions_project ON public.ai_suggestions(project_id);
CREATE INDEX idx_ai_suggestions_status ON public.ai_suggestions(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.native_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.native_backlog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_burndown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check project membership
CREATE OR REPLACE FUNCTION public.is_pmi_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pmi_projects 
    WHERE id = p_project_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Native Sprints policies
CREATE POLICY "Users can view sprints for their projects"
  ON public.native_sprints FOR SELECT
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can create sprints for their projects"
  ON public.native_sprints FOR INSERT
  WITH CHECK (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can update sprints for their projects"
  ON public.native_sprints FOR UPDATE
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can delete sprints for their projects"
  ON public.native_sprints FOR DELETE
  USING (public.is_pmi_project_member(project_id));

-- Native Backlog Items policies
CREATE POLICY "Users can view backlog items for their projects"
  ON public.native_backlog_items FOR SELECT
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can create backlog items for their projects"
  ON public.native_backlog_items FOR INSERT
  WITH CHECK (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can update backlog items for their projects"
  ON public.native_backlog_items FOR UPDATE
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can delete backlog items for their projects"
  ON public.native_backlog_items FOR DELETE
  USING (public.is_pmi_project_member(project_id));

-- Board Columns policies
CREATE POLICY "Users can view board columns for their projects"
  ON public.board_columns FOR SELECT
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can manage board columns for their projects"
  ON public.board_columns FOR ALL
  USING (public.is_pmi_project_member(project_id));

-- Item Comments policies
CREATE POLICY "Users can view comments on accessible items"
  ON public.item_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.native_backlog_items b 
    WHERE b.id = item_id AND public.is_pmi_project_member(b.project_id)
  ));

CREATE POLICY "Users can create comments on accessible items"
  ON public.item_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.native_backlog_items b 
    WHERE b.id = item_id AND public.is_pmi_project_member(b.project_id)
  ) AND author_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON public.item_comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON public.item_comments FOR DELETE
  USING (author_id = auth.uid());

-- Item Attachments policies
CREATE POLICY "Users can view attachments on accessible items"
  ON public.item_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.native_backlog_items b 
    WHERE b.id = item_id AND public.is_pmi_project_member(b.project_id)
  ));

CREATE POLICY "Users can upload attachments to accessible items"
  ON public.item_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.native_backlog_items b 
    WHERE b.id = item_id AND public.is_pmi_project_member(b.project_id)
  ) AND uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own attachments"
  ON public.item_attachments FOR DELETE
  USING (uploaded_by = auth.uid());

-- AI Suggestions policies
CREATE POLICY "Users can view AI suggestions for their projects"
  ON public.ai_suggestions FOR SELECT
  USING (public.is_pmi_project_member(project_id));

CREATE POLICY "System can create AI suggestions"
  ON public.ai_suggestions FOR INSERT
  WITH CHECK (public.is_pmi_project_member(project_id));

CREATE POLICY "Users can update AI suggestion status"
  ON public.ai_suggestions FOR UPDATE
  USING (public.is_pmi_project_member(project_id));

-- Sprint Burndown policies
CREATE POLICY "Users can view burndown for their sprints"
  ON public.sprint_burndown FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.native_sprints s 
    WHERE s.id = sprint_id AND public.is_pmi_project_member(s.project_id)
  ));

CREATE POLICY "System can manage burndown snapshots"
  ON public.sprint_burndown FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.native_sprints s 
    WHERE s.id = sprint_id AND public.is_pmi_project_member(s.project_id)
  ));

-- Activity Log policies
CREATE POLICY "Users can view activity for their items"
  ON public.item_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.native_backlog_items b 
    WHERE b.id = item_id AND public.is_pmi_project_member(b.project_id)
  ));

CREATE POLICY "System can create activity logs"
  ON public.item_activity_log FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.native_backlog_items b 
    WHERE b.id = item_id AND public.is_pmi_project_member(b.project_id)
  ));

-- =====================================================
-- TRIGGERS for automatic updates
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_native_sprints_updated_at
  BEFORE UPDATE ON public.native_sprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_native_backlog_items_updated_at
  BEFORE UPDATE ON public.native_backlog_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_item_comments_updated_at
  BEFORE UPDATE ON public.item_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_timestamp();

-- Auto-create activity log on status change
CREATE OR REPLACE FUNCTION public.log_backlog_item_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO public.item_activity_log (item_id, actor_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status, NEW.status);
  END IF;
  IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
    INSERT INTO public.item_activity_log (item_id, actor_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'assigned', OLD.assignee_id::text, NEW.assignee_id::text);
  END IF;
  IF OLD.priority != NEW.priority THEN
    INSERT INTO public.item_activity_log (item_id, actor_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority_changed', OLD.priority, NEW.priority);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_backlog_item_changes_trigger
  AFTER UPDATE ON public.native_backlog_items
  FOR EACH ROW EXECUTE FUNCTION public.log_backlog_item_changes();

-- Log item creation
CREATE OR REPLACE FUNCTION public.log_backlog_item_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.item_activity_log (item_id, actor_id, action_type, new_value)
  VALUES (NEW.id, auth.uid(), 'created', NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_backlog_item_creation_trigger
  AFTER INSERT ON public.native_backlog_items
  FOR EACH ROW EXECUTE FUNCTION public.log_backlog_item_creation();

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.native_backlog_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_suggestions;