
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create knowledge base table for RAG
CREATE TABLE public.project_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('retro_insight', 'decision', 'lesson_learned', 'sprint_summary', 'action_item', 'standup_insight', 'workflow_output')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding extensions.vector(32),
  search_vector tsvector,
  source_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_knowledge_base_project ON public.project_knowledge_base(project_id);
CREATE INDEX idx_knowledge_base_type ON public.project_knowledge_base(content_type);
CREATE INDEX idx_knowledge_base_created ON public.project_knowledge_base(created_at DESC);
CREATE INDEX idx_knowledge_base_search ON public.project_knowledge_base USING gin(search_vector);

-- HNSW index for vector similarity (works on empty tables unlike IVFFlat)
CREATE INDEX idx_knowledge_base_embedding ON public.project_knowledge_base 
  USING hnsw (embedding extensions.vector_cosine_ops);

-- Auto-generate tsvector on insert/update
CREATE OR REPLACE FUNCTION public.update_knowledge_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_knowledge_search_vector
BEFORE INSERT OR UPDATE ON public.project_knowledge_base
FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_search_vector();

-- Hybrid search function: combines vector similarity + full-text ranking
CREATE OR REPLACE FUNCTION public.search_project_knowledge(
  query_embedding extensions.vector(32),
  query_text TEXT,
  target_project_id UUID,
  match_count INTEGER DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.25,
  content_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  title TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  text_rank FLOAT,
  combined_score FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.content_type,
    kb.title,
    kb.content,
    kb.metadata,
    (1 - (kb.embedding <=> query_embedding))::FLOAT as similarity,
    ts_rank(kb.search_vector, plainto_tsquery('english', query_text))::FLOAT as text_rank,
    (0.7 * (1 - (kb.embedding <=> query_embedding)) + 0.3 * COALESCE(ts_rank(kb.search_vector, plainto_tsquery('english', query_text)), 0))::FLOAT as combined_score,
    kb.created_at
  FROM project_knowledge_base kb
  WHERE kb.project_id = target_project_id
    AND kb.embedding IS NOT NULL
    AND (1 - (kb.embedding <=> query_embedding)) > similarity_threshold
    AND (content_types IS NULL OR kb.content_type = ANY(content_types))
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- Enable RLS
ALTER TABLE public.project_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view knowledge"
ON public.project_knowledge_base FOR SELECT
USING (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can insert knowledge"
ON public.project_knowledge_base FOR INSERT
WITH CHECK (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can update knowledge"
ON public.project_knowledge_base FOR UPDATE
USING (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

CREATE POLICY "Project members can delete knowledge"
ON public.project_knowledge_base FOR DELETE
USING (public.is_project_member(project_id, auth.uid()) OR public.can_access_workspace_project(project_id, auth.uid()));

-- Data retention: auto-cleanup function for entries older than 1 year
CREATE OR REPLACE FUNCTION public.cleanup_old_knowledge_entries(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM project_knowledge_base
  WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL
  RETURNING 1 INTO deleted_count;
  
  RETURN COALESCE(deleted_count, 0);
END;
$$;
