
-- Workspace chat messages for team communication
CREATE TABLE public.workspace_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES public.workspace_chat_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workspace_chat_workspace ON public.workspace_chat_messages(workspace_id, created_at DESC);
CREATE INDEX idx_workspace_chat_author ON public.workspace_chat_messages(author_id);
CREATE INDEX idx_workspace_chat_reply ON public.workspace_chat_messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.workspace_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS: workspace members can read messages
CREATE POLICY "Workspace members can read chat"
  ON public.workspace_chat_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_chat_messages.workspace_id AND wm.user_id = auth.uid()
    )
  );

-- RLS: authenticated users can insert into their workspace
CREATE POLICY "Workspace members can send messages"
  ON public.workspace_chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_chat_messages.workspace_id AND wm.user_id = auth.uid()
      )
    )
  );

-- RLS: authors can update their own messages
CREATE POLICY "Authors can update own messages"
  ON public.workspace_chat_messages FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- RLS: authors can delete their own messages
CREATE POLICY "Authors can delete own messages"
  ON public.workspace_chat_messages FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_chat_messages;
