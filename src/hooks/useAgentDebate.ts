import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DebateTopicType = 'sprint_plan' | 'backlog_priority' | 'risk_assessment' | 'epic_validation' | 'retrospective';

export interface DebateVote {
  agent: string;
  vote: 'approve' | 'reject' | 'conditional_approve' | 'abstain';
  conditions?: string;
}

export interface DebateResponse {
  id: string;
  agent_name: string;
  agent_role: string;
  round_number: number;
  response_type: string;
  content: string;
  confidence_score: number;
  agrees_with: string[];
  disagrees_with: string[];
  reasoning: string;
  created_at: string;
}

export interface DebateSession {
  id: string;
  topic: string;
  topic_type: DebateTopicType;
  status: string;
  consensus_confidence: number | null;
  final_recommendation: string | null;
  consensus_result: any;
  created_at: string;
  completed_at: string | null;
}

export interface DebateResult {
  sessionId: string;
  status: string;
  recommendation: string;
  confidence: number;
  votes: DebateVote[];
  agentCount: number;
  roundsCompleted: number;
}

export function useAgentDebate(projectId?: string) {
  const [isDebating, setIsDebating] = useState(false);
  const [currentResult, setCurrentResult] = useState<DebateResult | null>(null);
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [liveResponses, setLiveResponses] = useState<DebateResponse[]>([]);

  // Load past debate sessions
  const loadSessions = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data, error } = await supabase
        .from('agent_debate_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions((data || []) as unknown as DebateSession[]);
    } catch (err) {
      console.error('Failed to load debate sessions:', err);
    }
  }, [projectId]);

  // Subscribe to realtime debate responses
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('debate-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_debate_responses',
        },
        (payload) => {
          setLiveResponses(prev => [...prev, payload.new as unknown as DebateResponse]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Start a new debate
  const startDebate = useCallback(async (
    topic: string,
    topicType: DebateTopicType,
    context?: Record<string, any>
  ): Promise<DebateResult | null> => {
    if (!projectId) {
      toast.error('No project selected');
      return null;
    }

    setIsDebating(true);
    setCurrentResult(null);
    setLiveResponses([]);

    try {
      const { data, error } = await supabase.functions.invoke('agent-debate', {
        body: { topic, topicType, projectId, context },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return null;
      }

      setCurrentResult(data as DebateResult);
      toast.success(`Consensus reached with ${(data.confidence * 100).toFixed(0)}% confidence`);
      await loadSessions();
      return data as DebateResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Debate failed';
      toast.error(message);
      return null;
    } finally {
      setIsDebating(false);
    }
  }, [projectId, loadSessions]);

  // Load responses for a specific session
  const loadSessionResponses = useCallback(async (sessionId: string): Promise<DebateResponse[]> => {
    try {
      const { data, error } = await supabase
        .from('agent_debate_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('round_number', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as DebateResponse[];
    } catch (err) {
      console.error('Failed to load responses:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    isDebating,
    currentResult,
    sessions,
    liveResponses,
    startDebate,
    loadSessions,
    loadSessionResponses,
  };
}
