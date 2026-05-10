
-- Dedicated corpus for AI agent learning material (not user-visible content)
CREATE TABLE IF NOT EXISTS public.ai_training_corpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_doc text NOT NULL,
  source_type text NOT NULL DEFAULT 'notebook',
  section text,
  kind text,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_training_corpus_search ON public.ai_training_corpus USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_ai_training_corpus_source ON public.ai_training_corpus(source_doc);
CREATE INDEX IF NOT EXISTS idx_ai_training_corpus_tags ON public.ai_training_corpus USING gin(tags);

ALTER TABLE public.ai_training_corpus ENABLE ROW LEVEL SECURITY;

-- Read-only for any authenticated user (agents learn; users may inspect via admin tools)
CREATE POLICY "Authenticated can read training corpus"
ON public.ai_training_corpus FOR SELECT
TO authenticated
USING (true);

-- Only platform owner can mutate (writes happen server-side via migrations / service role)
CREATE POLICY "Platform owner can insert training corpus"
ON public.ai_training_corpus FOR INSERT
TO authenticated
WITH CHECK (is_platform_owner(auth.uid()));

CREATE POLICY "Platform owner can update training corpus"
ON public.ai_training_corpus FOR UPDATE
TO authenticated
USING (is_platform_owner(auth.uid()));

CREATE POLICY "Platform owner can delete training corpus"
ON public.ai_training_corpus FOR DELETE
TO authenticated
USING (is_platform_owner(auth.uid()));

-- tsvector trigger for hybrid search
CREATE OR REPLACE FUNCTION public.update_training_corpus_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.section,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content,'')), 'C');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_training_corpus_search ON public.ai_training_corpus;
CREATE TRIGGER trg_training_corpus_search
BEFORE INSERT OR UPDATE ON public.ai_training_corpus
FOR EACH ROW EXECUTE FUNCTION public.update_training_corpus_search_vector();

-- Remove the notebook rows accidentally seeded into demo project knowledge base
DELETE FROM public.project_knowledge_base
WHERE metadata->>'source_doc' = 'jira-issue-prediction-capstone';
