import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KnowledgeEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  relevance: {
    vectorSimilarity: number;
    textRank: number;
    combinedScore: number;
  };
  createdAt: string;
}

interface UseRAGReturn {
  isSearching: boolean;
  isIngesting: boolean;
  results: KnowledgeEntry[];
  contextSummary: string;
  search: (projectId: string, query: string, options?: {
    matchCount?: number;
    contentTypes?: string[];
  }) => Promise<KnowledgeEntry[]>;
  ingest: (params: {
    projectId: string;
    contentType: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    sourceId?: string;
  }) => Promise<boolean>;
}

export function useRAG(): UseRAGReturn {
  const [isSearching, setIsSearching] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [results, setResults] = useState<KnowledgeEntry[]>([]);
  const [contextSummary, setContextSummary] = useState('');

  const search = useCallback(async (
    projectId: string,
    query: string,
    options?: { matchCount?: number; contentTypes?: string[] }
  ): Promise<KnowledgeEntry[]> => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-retrieve', {
        body: {
          projectId,
          query,
          matchCount: options?.matchCount || 5,
          contentTypes: options?.contentTypes || null,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResults(data.results || []);
      setContextSummary(data.contextSummary || '');
      return data.results || [];
    } catch (err) {
      console.error('RAG search failed:', err);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const ingest = useCallback(async (params: {
    projectId: string;
    contentType: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    sourceId?: string;
  }): Promise<boolean> => {
    setIsIngesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-ingest', {
        body: params,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return true;
    } catch (err) {
      console.error('RAG ingest failed:', err);
      return false;
    } finally {
      setIsIngesting(false);
    }
  }, []);

  return {
    isSearching,
    isIngesting,
    results,
    contextSummary,
    search,
    ingest,
  };
}
