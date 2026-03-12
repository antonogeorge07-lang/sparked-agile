import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationConfig {
  active: boolean;
  integration_id: string | null;
  board_url?: string;
  board_id?: string;
  repo_url?: string;
  repo_name?: string;
  calendar_id?: string;
  teams_channel_id?: string;
  distribution_list?: string;
}

interface UnifiedIntegrations {
  jira: IntegrationConfig;
  github: IntegrationConfig;
  microsoft: IntegrationConfig;
  slack: IntegrationConfig;
}

interface UseUnifiedIntegrationsReturn {
  integrations: UnifiedIntegrations | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasActiveIntegration: (type: keyof UnifiedIntegrations) => boolean;
}

const defaultIntegrations: UnifiedIntegrations = {
  jira: { active: false, integration_id: null },
  github: { active: false, integration_id: null },
  microsoft: { active: false, integration_id: null },
  slack: { active: false, integration_id: null }
};

export const useUnifiedIntegrations = (projectId: string | null): UseUnifiedIntegrationsReturn => {
  const [integrations, setIntegrations] = useState<UnifiedIntegrations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!projectId) {
      setIntegrations(defaultIntegrations);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query integrations table directly (single source of truth)
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('id, integration_type, is_active, config')
        .eq('project_id', projectId);

      if (integrationsError) throw integrationsError;

      const result: UnifiedIntegrations = { ...defaultIntegrations };

      for (const integration of (integrationsData || [])) {
        const config = integration.config as Record<string, any> || {};
        const type = integration.integration_type as keyof UnifiedIntegrations;
        
        if (type in result) {
          result[type] = {
            active: integration.is_active,
            integration_id: integration.id,
            ...config
          };
        }
      }

      setIntegrations(result);
    } catch (err: any) {
      console.error('Error fetching unified integrations:', err);
      setError(err.message || 'Failed to fetch integrations');
      setIntegrations(defaultIntegrations);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const hasActiveIntegration = useCallback((type: keyof UnifiedIntegrations): boolean => {
    return integrations?.[type]?.active || false;
  }, [integrations]);

  return {
    integrations,
    isLoading,
    error,
    refresh: fetchIntegrations,
    hasActiveIntegration
  };
};
