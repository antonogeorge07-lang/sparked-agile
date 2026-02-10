
-- Agent Debate Sessions: tracks multi-agent deliberation rounds
CREATE TABLE public.agent_debate_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.pmi_projects(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  topic_type TEXT NOT NULL CHECK (topic_type IN ('sprint_plan', 'backlog_priority', 'risk_assessment', 'epic_validation', 'retrospective')),
  context JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'debating' CHECK (status IN ('debating', 'voting', 'consensus_reached', 'escalated', 'cancelled')),
  consensus_result JSONB,
  consensus_confidence NUMERIC(5,2),
  final_recommendation TEXT,
  initiated_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Debate Responses: individual agent contributions per round
CREATE TABLE public.agent_debate_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.agent_debate_sessions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 1,
  response_type TEXT NOT NULL CHECK (response_type IN ('proposal', 'critique', 'validation', 'revision', 'vote')),
  content TEXT NOT NULL,
  confidence_score NUMERIC(5,2),
  agrees_with JSONB DEFAULT '[]'::jsonb,
  disagrees_with JSONB DEFAULT '[]'::jsonb,
  reasoning TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent Consensus Votes: formal vote tracking
CREATE TABLE public.agent_consensus_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.agent_debate_sessions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain', 'conditional_approve')),
  conditions TEXT,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, agent_name)
);

-- Enable RLS
ALTER TABLE public.agent_debate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_debate_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_consensus_votes ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view debates for their projects
CREATE POLICY "Users view own project debates"
  ON public.agent_debate_sessions FOR SELECT
  USING (public.is_pmi_project_member(project_id) OR initiated_by = auth.uid());

CREATE POLICY "Users create debates for own projects"
  ON public.agent_debate_sessions FOR INSERT
  WITH CHECK (public.is_pmi_project_member(project_id) AND initiated_by = auth.uid());

CREATE POLICY "System updates debate sessions"
  ON public.agent_debate_sessions FOR UPDATE
  USING (public.is_pmi_project_member(project_id) OR initiated_by = auth.uid());

-- Responses inherit session access
CREATE POLICY "Users view debate responses"
  ON public.agent_debate_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agent_debate_sessions s
    WHERE s.id = session_id 
    AND (public.is_pmi_project_member(s.project_id) OR s.initiated_by = auth.uid())
  ));

CREATE POLICY "System inserts debate responses"
  ON public.agent_debate_responses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agent_debate_sessions s
    WHERE s.id = session_id 
    AND (public.is_pmi_project_member(s.project_id) OR s.initiated_by = auth.uid())
  ));

-- Votes inherit session access
CREATE POLICY "Users view consensus votes"
  ON public.agent_consensus_votes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agent_debate_sessions s
    WHERE s.id = session_id 
    AND (public.is_pmi_project_member(s.project_id) OR s.initiated_by = auth.uid())
  ));

CREATE POLICY "System inserts consensus votes"
  ON public.agent_consensus_votes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agent_debate_sessions s
    WHERE s.id = session_id 
    AND (public.is_pmi_project_member(s.project_id) OR s.initiated_by = auth.uid())
  ));

-- Indexes for performance
CREATE INDEX idx_debate_sessions_project ON public.agent_debate_sessions(project_id);
CREATE INDEX idx_debate_sessions_status ON public.agent_debate_sessions(status);
CREATE INDEX idx_debate_responses_session ON public.agent_debate_responses(session_id);
CREATE INDEX idx_debate_responses_round ON public.agent_debate_responses(session_id, round_number);
CREATE INDEX idx_consensus_votes_session ON public.agent_consensus_votes(session_id);

-- Enable realtime for live debate tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_debate_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_debate_sessions;
