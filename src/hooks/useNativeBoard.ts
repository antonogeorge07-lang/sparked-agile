import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NativeBacklogItem, BoardColumn, DEFAULT_BOARD_COLUMNS } from '@/types/native-pm';

interface UseNativeBoardReturn {
  items: NativeBacklogItem[];
  columns: BoardColumn[];
  isLoading: boolean;
  error: string | null;
  epicFilter: string | null;
  setEpicFilter: (epicId: string | null) => void;
  createItem: (item: Partial<NativeBacklogItem>) => Promise<NativeBacklogItem | null>;
  updateItem: (id: string, updates: Partial<NativeBacklogItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  moveItem: (itemId: string, newStatus: string, newPosition: number) => Promise<boolean>;
  createColumn: (column: Partial<BoardColumn>) => Promise<BoardColumn | null>;
  updateColumn: (id: string, updates: Partial<BoardColumn>) => Promise<boolean>;
  deleteColumn: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useNativeBoard(projectId: string | null): UseNativeBoardReturn {
  const [allItems, setAllItems] = useState<NativeBacklogItem[]>([]);
  const [epicFilter, setEpicFilter] = useState<string | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter items by epic
  const items = epicFilter 
    ? allItems.filter(item => item.epic_id === epicFilter)
    : allItems;

  const loadData = useCallback(async () => {
    if (!projectId) {
      setAllItems([]);
      setColumns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('board_columns')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (columnsError) throw columnsError;

      // If no columns exist, create default ones
      if (!columnsData || columnsData.length === 0) {
        const defaultColumns = [
          { name: 'Backlog', position: 0, wip_limit: null, color: '#94a3b8', is_done_column: false },
          { name: 'To Do', position: 1, wip_limit: null, color: '#60a5fa', is_done_column: false },
          { name: 'In Progress', position: 2, wip_limit: 5, color: '#fbbf24', is_done_column: false },
          { name: 'In Review', position: 3, wip_limit: 3, color: '#a78bfa', is_done_column: false },
          { name: 'Done', position: 4, wip_limit: null, color: '#34d399', is_done_column: true },
        ];

        const { data: newColumns, error: createError } = await supabase
          .from('board_columns')
          .insert(defaultColumns.map(col => ({ ...col, project_id: projectId })))
          .select();

        if (createError) throw createError;
        setColumns(newColumns as BoardColumn[]);
      } else {
        setColumns(columnsData as BoardColumn[]);
      }

      // Load items
      // Fetch all items with pagination to avoid 1000-row default limit
      let allItemsData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: pageData, error: pageError } = await supabase
          .from('native_backlog_items')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true })
          .range(from, from + pageSize - 1);

        if (pageError) throw pageError;
        if (!pageData || pageData.length < pageSize) hasMore = false;
        if (pageData) allItemsData = [...allItemsData, ...pageData];
        from += pageSize;
      }

      const itemsData = allItemsData;
      const itemsError = null;

      if (itemsError) throw itemsError;
      setAllItems(itemsData as NativeBacklogItem[]);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load board data';
      setError(message);
      console.error('Board load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Initial load and realtime subscription
  useEffect(() => {
    loadData();

    if (!projectId) return;

    // Subscribe to realtime changes for items AND columns
    const channel = supabase
      .channel(`board-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'native_backlog_items',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAllItems(prev => [...prev, payload.new as NativeBacklogItem]);
          } else if (payload.eventType === 'UPDATE') {
            setAllItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new as NativeBacklogItem : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setAllItems(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'board_columns',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setColumns(prev => [...prev, payload.new as BoardColumn].sort((a, b) => a.position - b.position));
          } else if (payload.eventType === 'UPDATE') {
            setColumns(prev => prev.map(col => 
              col.id === payload.new.id ? payload.new as BoardColumn : col
            ).sort((a, b) => a.position - b.position));
          } else if (payload.eventType === 'DELETE') {
            setColumns(prev => prev.filter(col => col.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, loadData]);

  const createItem = async (item: Partial<NativeBacklogItem>): Promise<NativeBacklogItem | null> => {
    if (!projectId) return null;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('native_backlog_items')
        .insert([{
          ...item,
          project_id: projectId,
          reporter_id: user.user?.id,
        }] as any)
        .select()
        .single();

      if (error) throw error;
      toast.success('Item created');
      return data as NativeBacklogItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      toast.error(message);
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<NativeBacklogItem>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('native_backlog_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message);
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('native_backlog_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Item deleted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
      return false;
    }
  };

  const moveItem = async (itemId: string, newStatus: string, newPosition: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('native_backlog_items')
        .update({ status: newStatus, position: newPosition })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move item';
      toast.error(message);
      return false;
    }
  };

  const createColumn = async (column: Partial<BoardColumn>): Promise<BoardColumn | null> => {
    if (!projectId) return null;

    try {
      const { data, error } = await supabase
        .from('board_columns')
        .insert([{ ...column, project_id: projectId }] as any)
        .select()
        .single();

      if (error) throw error;
      setColumns(prev => [...prev, data as BoardColumn].sort((a, b) => a.position - b.position));
      toast.success('Column created');
      return data as BoardColumn;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create column';
      toast.error(message);
      return null;
    }
  };

  const updateColumn = async (id: string, updates: Partial<BoardColumn>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('board_columns')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setColumns(prev => prev.map(col => col.id === id ? { ...col, ...updates } : col));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update column';
      toast.error(message);
      return false;
    }
  };

  const deleteColumn = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('board_columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setColumns(prev => prev.filter(col => col.id !== id));
      toast.success('Column deleted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete column';
      toast.error(message);
      return false;
    }
  };

  return {
    items,
    columns,
    isLoading,
    error,
    epicFilter,
    setEpicFilter,
    createItem,
    updateItem,
    deleteItem,
    moveItem,
    createColumn,
    updateColumn,
    deleteColumn,
    refresh: loadData,
  };
}
