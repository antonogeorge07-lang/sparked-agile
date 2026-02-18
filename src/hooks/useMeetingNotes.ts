import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MeetingDecision {
  decision: string;
  rationale?: string;
  owner?: string;
}

export interface MeetingActionItem {
  action: string;
  assignee?: string;
  priority: 'high' | 'medium' | 'low';
  due_date_suggestion?: string;
}

export interface MeetingTopic {
  topic: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  notes?: string;
}

export interface MeetingAnalysis {
  noteId: string | null;
  summary: string;
  decisions: MeetingDecision[];
  actionItems: MeetingActionItem[];
  keyTopics: MeetingTopic[];
}

interface UseMeetingNotesReturn {
  isProcessing: boolean;
  analysis: MeetingAnalysis | null;
  processNotes: (params: {
    projectId: string;
    title: string;
    meetingType?: string;
    rawNotes: string;
    attendees?: string[];
    meetingDate?: string;
  }) => Promise<MeetingAnalysis | null>;
  loadNotes: (projectId: string) => Promise<void>;
  savedNotes: Array<{
    id: string;
    title: string;
    meeting_type: string;
    ai_summary: string | null;
    extracted_action_items: MeetingActionItem[];
    meeting_date: string;
    created_at: string;
  }>;
}

export function useMeetingNotes(): UseMeetingNotesReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);

  const processNotes = useCallback(async (params: {
    projectId: string;
    title: string;
    meetingType?: string;
    rawNotes: string;
    attendees?: string[];
    meetingDate?: string;
  }): Promise<MeetingAnalysis | null> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-meeting-notes', {
        body: params,
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return null;
      }
      const result: MeetingAnalysis = {
        noteId: data.noteId,
        summary: data.summary,
        decisions: data.decisions,
        actionItems: data.actionItems,
        keyTopics: data.keyTopics,
      };
      setAnalysis(result);
      toast.success('Meeting notes processed successfully');
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process meeting notes');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const loadNotes = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('id, title, meeting_type, ai_summary, extracted_action_items, meeting_date, created_at')
        .eq('project_id', projectId)
        .order('meeting_date', { ascending: false })
        .limit(20);
      if (error) throw error;
      setSavedNotes(data || []);
    } catch (err) {
      console.error('Failed to load meeting notes:', err);
    }
  }, []);

  return { isProcessing, analysis, processNotes, loadNotes, savedNotes };
}
