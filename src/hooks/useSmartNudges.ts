import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SmartNudge {
  id: string;
  project_id: string;
  user_id: string;
  nudge_type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  category: string;
  suggested_action: string | null;
  related_item_id: string | null;
  related_item_type: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

interface UseSmartNudgesReturn {
  nudges: SmartNudge[];
  unreadCount: number;
  isGenerating: boolean;
  aiPowered: boolean;
  generateNudges: (projectId: string) => Promise<number>;
  markAsRead: (nudgeId: string) => Promise<void>;
  dismissNudge: (nudgeId: string) => Promise<void>;
  loadNudges: (projectId: string) => Promise<void>;
}

export function useSmartNudges(): UseSmartNudgesReturn {
  const [nudges, setNudges] = useState<SmartNudge[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);

  const unreadCount = nudges.filter(n => !n.is_read && !n.is_dismissed).length;

  const generateNudges = useCallback(async (projectId: string): Promise<number> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-nudges', {
        body: { projectId },
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return 0;
      }
      setAiPowered(!!data.aiPowered);
      if (data.generated > 0) {
        toast.info(`${data.generated} new insight${data.generated !== 1 ? 's' : ''} from your AI colleague`);
        await loadNudges(projectId);
      } else {
        toast.success("All looks good — no new observations right now");
      }
      return data.generated;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate insights');
      return 0;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const loadNudges = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('smart_nudges')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setNudges((data || []) as SmartNudge[]);
    } catch (err) {
      console.error('Failed to load nudges:', err);
    }
  }, []);

  const markAsRead = useCallback(async (nudgeId: string) => {
    try {
      await supabase
        .from('smart_nudges')
        .update({ is_read: true })
        .eq('id', nudgeId);
      setNudges(prev => prev.map(n => n.id === nudgeId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark nudge as read:', err);
    }
  }, []);

  const dismissNudge = useCallback(async (nudgeId: string) => {
    try {
      await supabase
        .from('smart_nudges')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', nudgeId);
      setNudges(prev => prev.filter(n => n.id !== nudgeId));
    } catch (err) {
      console.error('Failed to dismiss nudge:', err);
    }
  }, []);

  return { nudges, unreadCount, isGenerating, aiPowered, generateNudges, markAsRead, dismissNudge, loadNudges };
}
