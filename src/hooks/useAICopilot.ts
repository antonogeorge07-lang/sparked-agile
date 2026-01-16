import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AISuggestion } from '@/types/native-pm';

type CopilotAction = 
  | 'generate_user_story'
  | 'suggest_acceptance_criteria'
  | 'estimate_story_points'
  | 'detect_blockers'
  | 'suggest_assignments'
  | 'forecast_sprint'
  | 'analyze_backlog'
  | 'generate_sprint_goal'
  | 'balance_workload';

interface UseAICopilotReturn {
  isProcessing: boolean;
  lastSuggestion: string | null;
  suggestions: AISuggestion[];
  invoke: (action: CopilotAction, params: {
    projectId: string;
    sprintId?: string;
    itemId?: string;
    context?: Record<string, any>;
  }) => Promise<string | null>;
  loadSuggestions: (projectId: string) => Promise<void>;
  acceptSuggestion: (id: string) => Promise<boolean>;
  dismissSuggestion: (id: string) => Promise<boolean>;
}

export function useAICopilot(): UseAICopilotReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const invoke = useCallback(async (
    action: CopilotAction,
    params: {
      projectId: string;
      sprintId?: string;
      itemId?: string;
      context?: Record<string, any>;
    }
  ): Promise<string | null> => {
    setIsProcessing(true);
    setLastSuggestion(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-copilot', {
        body: {
          action,
          ...params,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('AI is busy. Please try again in a moment.');
        } else if (data.error.includes('credits')) {
          toast.error('AI credits exhausted. Please add funds.');
        } else {
          toast.error(data.error);
        }
        return null;
      }

      setLastSuggestion(data.suggestion);
      toast.success('AI suggestion generated');
      return data.suggestion;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed';
      toast.error(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const loadSuggestions = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSuggestions(data as AISuggestion[]);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, []);

  const acceptSuggestion = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ status: 'accepted' })
        .eq('id', id);

      if (error) throw error;
      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast.success('Suggestion accepted');
      return true;
    } catch (err) {
      toast.error('Failed to accept suggestion');
      return false;
    }
  }, []);

  const dismissSuggestion = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ status: 'dismissed' })
        .eq('id', id);

      if (error) throw error;
      setSuggestions(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      toast.error('Failed to dismiss suggestion');
      return false;
    }
  }, []);

  return {
    isProcessing,
    lastSuggestion,
    suggestions,
    invoke,
    loadSuggestions,
    acceptSuggestion,
    dismissSuggestion,
  };
}
