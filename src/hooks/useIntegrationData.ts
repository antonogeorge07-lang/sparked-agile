import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useIntegrationData = (projectId: string | null) => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [jiraData, setJiraData] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadIntegrations();
    }
  }, [projectId]);

  const loadIntegrations = async () => {
    if (!projectId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('integrations')
      .select('id, name, integration_type, is_active, project_id, created_at, updated_at')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (!error && data) {
      setIntegrations(data);
      
      // Set null for Jira and GitHub data - will be populated when actual integrations fetch real data
      const jiraIntegration = data.find(i => i.integration_type === 'jira');
      const githubIntegration = data.find(i => i.integration_type === 'github');

      if (jiraIntegration) {
        setJiraData({ jiraIssues: [] });
      }

      if (githubIntegration) {
        setGithubData({ gitCommits: [], gitPullRequests: [] });
      }
    }

    setIsLoading(false);
  };

  return {
    integrations,
    jiraData,
    githubData,
    isLoading,
    hasJiraIntegration: integrations.some(i => i.integration_type === 'jira'),
    hasGithubIntegration: integrations.some(i => i.integration_type === 'github')
  };
};
