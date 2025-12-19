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
    
    // Fetch integrations
    const { data: integrationsData, error: integrationsError } = await supabase
      .from('integrations')
      .select('id, name, integration_type, is_active, project_id, created_at, updated_at')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (integrationsError) {
      console.error('Error fetching integrations:', integrationsError);
      setIsLoading(false);
      return;
    }

    setIntegrations(integrationsData || []);

    // Fetch workspace details for GitHub repo URL and Jira board info
    const { data: workspace } = await supabase
      .from('project_workspaces')
      .select('id, jira_board_id, jira_board_url, github_repo_url, github_repo_name')
      .eq('project_id', projectId)
      .maybeSingle();

    const jiraIntegration = integrationsData?.find(i => i.integration_type === 'jira');
    const githubIntegration = integrationsData?.find(i => i.integration_type === 'github');

    // Fetch real Jira data if integration exists
    if (jiraIntegration && workspace?.jira_board_id) {
      try {
        const { data: jiraResponse, error: jiraError } = await supabase.functions.invoke('fetch-jira-backlog', {
          body: { workspaceId: workspace.id }
        });
        
        if (!jiraError && jiraResponse?.backlogItems) {
          setJiraData({ 
            jiraIssues: jiraResponse.backlogItems,
            totalCount: jiraResponse.totalCount 
          });
        } else {
          console.log('Jira fetch info:', jiraError || jiraResponse?.error || 'No backlog items');
          setJiraData(null);
        }
      } catch (err) {
        console.error('Error fetching Jira data:', err);
        setJiraData(null);
      }
    } else {
      setJiraData(null);
    }

    // Fetch real GitHub data if integration exists
    if (githubIntegration && workspace?.github_repo_url) {
      try {
        const { data: githubResponse, error: githubError } = await supabase.functions.invoke('fetch-github-activity', {
          body: { 
            projectId,
            repoUrl: workspace.github_repo_url 
          }
        });
        
        if (!githubError && githubResponse) {
          setGithubData({ 
            gitCommits: githubResponse.commits || [],
            gitPullRequests: githubResponse.pullRequests || [],
            gitIssues: githubResponse.issues || [],
            repoName: githubResponse.repoName
          });
        } else {
          console.log('GitHub fetch info:', githubError || githubResponse?.message);
          setGithubData(null);
        }
      } catch (err) {
        console.error('Error fetching GitHub data:', err);
        setGithubData(null);
      }
    } else {
      setGithubData(null);
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
