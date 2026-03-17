import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'sprint' | 'epic' | 'backlog_item';
  title: string;
  description: string | null;
  status: string | null;
  projectName?: string;
  route: string;
  relevance: number;
}

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchPattern = `%${query}%`;

    try {
      const [projectsRes, backlogRes, sprintsRes, epicsRes] = await Promise.all([
        // Search projects
        supabase
          .from('projects')
          .select('id, name, description')
          .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .limit(5),

        // Search native backlog items
        supabase
          .from('native_backlog_items')
          .select('id, title, description, status, priority, project_id, item_type')
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .limit(8),

        // Search native sprints
        supabase
          .from('native_sprints')
          .select('id, name, goal, status, project_id')
          .or(`name.ilike.${searchPattern},goal.ilike.${searchPattern}`)
          .limit(5),

        // Search epics
        supabase
          .from('epics')
          .select('id, title, description, status')
          .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
          .limit(5),
      ]);

      const combined: SearchResult[] = [];

      // Map projects
      (projectsRes.data || []).forEach((p) => {
        combined.push({
          id: p.id,
          type: 'project',
          title: p.name,
          description: p.description,
          status: p.status,
          route: `/project/${p.id}`,
          relevance: p.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.7,
        });
      });

      // Map backlog items
      (backlogRes.data || []).forEach((item) => {
        combined.push({
          id: item.id,
          type: 'backlog_item',
          title: item.title,
          description: item.description,
          status: item.status,
          route: `/project/${item.project_id}/command-centre`,
          relevance: item.title.toLowerCase().includes(query.toLowerCase()) ? 0.9 : 0.6,
        });
      });

      // Map sprints
      (sprintsRes.data || []).forEach((s) => {
        combined.push({
          id: s.id,
          type: 'sprint',
          title: s.name,
          description: s.goal,
          status: s.status,
          route: `/project/${s.project_id}/command-centre`,
          relevance: s.name.toLowerCase().includes(query.toLowerCase()) ? 0.85 : 0.6,
        });
      });

      // Map epics
      (epicsRes.data || []).forEach((e) => {
        combined.push({
          id: e.id,
          type: 'epic',
          title: e.title,
          description: e.description,
          status: e.status,
          route: `/epics/${e.id}`,
          relevance: e.title.toLowerCase().includes(query.toLowerCase()) ? 0.9 : 0.65,
        });
      });

      // Sort by relevance
      combined.sort((a, b) => b.relevance - a.relevance);
      setResults(combined);
    } catch (err) {
      console.error('Global search error:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { results, isSearching, search };
}
