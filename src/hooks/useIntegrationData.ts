import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface CacheEntry {
  data: any;
  expiresAt: number;
}

// In-memory cache for quick access
const memoryCache = new Map<string, CacheEntry>();

// Retry helper with exponential backoff
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const useIntegrationData = (projectId: string | null) => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [jiraData, setJiraData] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const subscriptionRef = useRef<any>(null);

  // Check memory cache first, then database cache
  const getCachedData = useCallback(async (cacheKey: string, integrationType: string) => {
    const memKey = `${projectId}:${integrationType}:${cacheKey}`;
    const memEntry = memoryCache.get(memKey);
    if (memEntry && memEntry.expiresAt > Date.now()) {
      console.log(`Memory cache hit for ${integrationType}`);
      return memEntry.data;
    }

    if (projectId) {
      const { data: cacheEntry } = await supabase
        .from('integration_cache')
        .select('data, expires_at')
        .eq('project_id', projectId)
        .eq('integration_type', integrationType)
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (cacheEntry) {
        console.log(`Database cache hit for ${integrationType}`);
        memoryCache.set(memKey, {
          data: cacheEntry.data,
          expiresAt: new Date(cacheEntry.expires_at).getTime(),
        });
        return cacheEntry.data;
      }
    }

    return null;
  }, [projectId]);

  // Store data in cache
  const setCacheData = useCallback(async (cacheKey: string, integrationType: string, data: any) => {
    if (!projectId) return;

    const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
    const memKey = `${projectId}:${integrationType}:${cacheKey}`;

    memoryCache.set(memKey, {
      data,
      expiresAt: expiresAt.getTime(),
    });

    await supabase
      .from('integration_cache')
      .upsert({
        project_id: projectId,
        integration_type: integrationType,
        cache_key: cacheKey,
        data,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,integration_type,cache_key',
      });
  }, [projectId]);

  // Invalidate cache for a specific integration
  const invalidateCache = useCallback(async (integrationType: string) => {
    if (!projectId) return;

    for (const key of memoryCache.keys()) {
      if (key.startsWith(`${projectId}:${integrationType}:`)) {
        memoryCache.delete(key);
      }
    }

    await supabase
      .from('integration_cache')
      .delete()
      .eq('project_id', projectId)
      .eq('integration_type', integrationType);
  }, [projectId]);

  const loadIntegrations = useCallback(async (forceRefresh = false) => {
    if (!projectId) return;

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Fetch integrations from unified integrations table (single source of truth)
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('id, name, integration_type, is_active, project_id, config, created_at, updated_at')
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (integrationsError) {
        console.error('Error fetching integrations:', integrationsError);
        return;
      }

      setIntegrations(integrationsData || []);

      const jiraIntegration = integrationsData?.find(i => i.integration_type === 'jira');
      const githubIntegration = integrationsData?.find(i => i.integration_type === 'github');

      // Extract config from integrations table directly
      const jiraConfig = jiraIntegration?.config as Record<string, any> | null;
      const githubConfig = githubIntegration?.config as Record<string, any> | null;

      // Fetch Jira data with caching and retry
      if (jiraIntegration && jiraConfig?.board_id) {
        const cacheKey = `backlog:${projectId}`;
        
        if (!forceRefresh) {
          const cached = await getCachedData(cacheKey, 'jira');
          if (cached) {
            setJiraData(cached);
            setLastUpdated(new Date());
          }
        }

        if (forceRefresh || !(await getCachedData(cacheKey, 'jira'))) {
          try {
            const jiraResponse = await fetchWithRetry(async () => {
              const { data, error } = await supabase.functions.invoke('fetch-jira-backlog', {
                body: { projectId }
              });
              if (error) throw error;
              return data;
            });
            
            if (jiraResponse?.backlogItems) {
              const data = { 
                jiraIssues: jiraResponse.backlogItems,
                totalCount: jiraResponse.totalCount 
              };
              setJiraData(data);
              await setCacheData(cacheKey, 'jira', data);
              setLastUpdated(new Date());
            }
          } catch (err) {
            console.error('Error fetching Jira data after retries:', err);
            if (!jiraData) setJiraData(null);
            toast.error('Failed to fetch Jira data. Will retry automatically.');
          }
        }
      } else {
        setJiraData(null);
      }

      // Fetch GitHub data with caching and retry
      if (githubIntegration && githubConfig?.repo_url) {
        const cacheKey = `activity:${projectId}`;
        
        if (!forceRefresh) {
          const cached = await getCachedData(cacheKey, 'github');
          if (cached) {
            setGithubData(cached);
            setLastUpdated(new Date());
          }
        }

        if (forceRefresh || !(await getCachedData(cacheKey, 'github'))) {
          try {
            const githubResponse = await fetchWithRetry(async () => {
              const { data, error } = await supabase.functions.invoke('fetch-github-activity', {
                body: { 
                  projectId,
                  repoUrl: githubConfig.repo_url 
                }
              });
              if (error) throw error;
              return data;
            });
            
            if (githubResponse) {
              const data = { 
                gitCommits: githubResponse.commits || [],
                gitPullRequests: githubResponse.pullRequests || [],
                gitIssues: githubResponse.issues || [],
                repoName: githubResponse.repoName
              };
              setGithubData(data);
              await setCacheData(cacheKey, 'github', data);
              setLastUpdated(new Date());
            }
          } catch (err) {
            console.error('Error fetching GitHub data after retries:', err);
            if (!githubData) setGithubData(null);
            toast.error('Failed to fetch GitHub data. Will retry automatically.');
          }
        }
      } else {
        setGithubData(null);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId, getCachedData, setCacheData, jiraData, githubData]);

  // Set up real-time subscription for webhook events
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`integration-events-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'integration_events',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          console.log('Received integration event:', payload);
          const event = payload.new as any;
          
          await invalidateCache(event.integration_type);
          
          toast.info(`${event.integration_type === 'github' ? 'GitHub' : 'Jira'} updated: ${event.event_type}`);
          
          loadIntegrations(true);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [projectId, invalidateCache, loadIntegrations]);

  // Initial load
  useEffect(() => {
    if (projectId) {
      loadIntegrations();
    }
  }, [projectId]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadIntegrations(true);
  }, [loadIntegrations]);

  return {
    integrations,
    jiraData,
    githubData,
    isLoading,
    isRefreshing,
    lastUpdated,
    refresh,
    invalidateCache,
    hasJiraIntegration: integrations.some(i => i.integration_type === 'jira'),
    hasGithubIntegration: integrations.some(i => i.integration_type === 'github')
  };
};
