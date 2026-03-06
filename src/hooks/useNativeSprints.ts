import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NativeSprint, SprintBurndown } from '@/types/native-pm';

interface UseNativeSprintsReturn {
  sprints: NativeSprint[];
  activeSprint: NativeSprint | null;
  burndown: SprintBurndown[];
  isLoading: boolean;
  createSprint: (sprint: Partial<NativeSprint>) => Promise<NativeSprint | null>;
  updateSprint: (id: string, updates: Partial<NativeSprint>) => Promise<boolean>;
  deleteSprint: (id: string) => Promise<boolean>;
  startSprint: (id: string) => Promise<boolean>;
  completeSprint: (id: string) => Promise<boolean>;
  loadBurndown: (sprintId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNativeSprints(projectId: string | null): UseNativeSprintsReturn {
  const [sprints, setSprints] = useState<NativeSprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<NativeSprint | null>(null);
  const [burndown, setBurndown] = useState<SprintBurndown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSprints = useCallback(async () => {
    if (!projectId) {
      setSprints([]);
      setActiveSprint(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('native_sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      const sprintList = data as NativeSprint[];
      setSprints(sprintList);
      
      // Find active sprint
      const active = sprintList.find(s => s.status === 'active');
      setActiveSprint(active || null);

    } catch (err) {
      console.error('Failed to load sprints:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadSprints();

    if (!projectId) return;

    // Subscribe to realtime sprint changes
    const channel = supabase
      .channel(`sprints-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'native_sprints',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSprints(prev => [payload.new as NativeSprint, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as NativeSprint;
            setSprints(prev => prev.map(s => s.id === updated.id ? updated : s));
            // Update active sprint reference
            if (updated.status === 'active') {
              setActiveSprint(updated);
            } else if (updated.status === 'completed') {
              setActiveSprint(prev => prev?.id === updated.id ? null : prev);
            }
          } else if (payload.eventType === 'DELETE') {
            setSprints(prev => prev.filter(s => s.id !== payload.old.id));
            setActiveSprint(prev => prev?.id === payload.old.id ? null : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSprints, projectId]);

  const createSprint = async (sprint: Partial<NativeSprint>): Promise<NativeSprint | null> => {
    if (!projectId) return null;

    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('native_sprints')
        .insert([{
          ...sprint,
          project_id: projectId,
          created_by: user.user?.id,
        }] as any)
        .select()
        .single();

      if (error) throw error;
      
      const newSprint = data as NativeSprint;
      setSprints(prev => [newSprint, ...prev]);
      toast.success('Sprint created');
      return newSprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create sprint';
      toast.error(message);
      return null;
    }
  };

  const updateSprint = async (id: string, updates: Partial<NativeSprint>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('native_sprints')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setSprints(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sprint';
      toast.error(message);
      return false;
    }
  };

  const deleteSprint = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('native_sprints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSprints(prev => prev.filter(s => s.id !== id));
      if (activeSprint?.id === id) setActiveSprint(null);
      toast.success('Sprint deleted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete sprint';
      toast.error(message);
      return false;
    }
  };

  const startSprint = async (id: string): Promise<boolean> => {
    // Check if there's already an active sprint
    if (activeSprint) {
      toast.error('Another sprint is already active. Complete it first.');
      return false;
    }

    const success = await updateSprint(id, { status: 'active' });
    if (success) {
      const sprint = sprints.find(s => s.id === id);
      if (sprint) {
        setActiveSprint({ ...sprint, status: 'active' });
      }
      toast.success('Sprint started');
    }
    return success;
  };

  const completeSprint = async (id: string): Promise<boolean> => {
    // Calculate completed velocity
    const { data: items } = await supabase
      .from('native_backlog_items')
      .select('story_points, status')
      .eq('sprint_id', id);

    const completedPoints = items
      ?.filter(i => i.status === 'done')
      .reduce((sum, i) => sum + (i.story_points || 0), 0) || 0;

    const success = await updateSprint(id, { 
      status: 'completed',
      velocity_completed: completedPoints,
    });

    if (success) {
      setActiveSprint(null);
      toast.success(`Sprint completed with ${completedPoints} points`);
    }
    return success;
  };

  const loadBurndown = async (sprintId: string) => {
    try {
      const { data, error } = await supabase
        .from('sprint_burndown')
        .select('*')
        .eq('sprint_id', sprintId)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      setBurndown(data as SprintBurndown[]);
    } catch (err) {
      console.error('Failed to load burndown:', err);
    }
  };

  return {
    sprints,
    activeSprint,
    burndown,
    isLoading,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    loadBurndown,
    refresh: loadSprints,
  };
}
