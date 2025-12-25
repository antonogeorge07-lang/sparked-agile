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
      // Try the unified view first
      const { data: viewData, error: viewError } = await supabase
        .from('unified_project_integrations')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!viewError && viewData) {
        setIntegrations({
          jira: {
            active: viewData.jira_active || false,
            integration_id: viewData.jira_integration_id,
            board_url: viewData.jira_board_url,
            board_id: viewData.jira_board_id
          },
          github: {
            active: viewData.github_active || false,
            integration_id: viewData.github_integration_id,
            repo_url: viewData.github_repo_url,
            repo_name: viewData.github_repo_name
          },
          microsoft: {
            active: viewData.microsoft_active || false,
            integration_id: viewData.microsoft_integration_id,
            calendar_id: viewData.outlook_calendar_id,
            teams_channel_id: viewData.teams_channel_id,
            distribution_list: viewData.team_distribution_list
          },
          slack: {
            active: viewData.slack_active || false,
            integration_id: viewData.slack_integration_id
          }
        });
        return;
      }

      // Fallback: query integrations table directly
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('id, integration_type, is_active, config')
        .eq('project_id', projectId);

      if (integrationsError) throw integrationsError;

      // Also get legacy workspace data
      const { data: workspace } = await supabase
        .from('project_workspaces')
        .select('jira_board_url, jira_board_id, github_repo_url, github_repo_name, outlook_calendar_id, teams_channel_id, team_distribution_list')
        .eq('project_id', projectId)
        .maybeSingle();

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

      // Merge with legacy workspace data if integration config is missing
      if (workspace) {
        if (!result.jira.board_url && workspace.jira_board_url) {
          result.jira.board_url = workspace.jira_board_url;
          result.jira.board_id = workspace.jira_board_id || undefined;
        }
        if (!result.github.repo_url && workspace.github_repo_url) {
          result.github.repo_url = workspace.github_repo_url;
          result.github.repo_name = workspace.github_repo_name || undefined;
        }
        if (!result.microsoft.calendar_id && workspace.outlook_calendar_id) {
          result.microsoft.calendar_id = workspace.outlook_calendar_id;
          result.microsoft.teams_channel_id = workspace.teams_channel_id || undefined;
          result.microsoft.distribution_list = workspace.team_distribution_list || undefined;
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
