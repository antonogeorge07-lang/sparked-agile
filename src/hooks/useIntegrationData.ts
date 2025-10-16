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
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (!error && data) {
      setIntegrations(data);
      
      // Mock data for demonstration - In production, this would fetch from actual APIs
      const jiraIntegration = data.find(i => i.integration_type === 'jira');
      const githubIntegration = data.find(i => i.integration_type === 'github');

      if (jiraIntegration) {
        setJiraData({
          jiraIssues: [
            {
              key: 'PROJ-123',
              summary: 'Implement user authentication flow',
              status: 'In Progress',
              priority: 'High',
              assignee: 'John Doe',
              updated: new Date().toISOString()
            },
            {
              key: 'PROJ-124',
              summary: 'Fix dashboard loading performance',
              status: 'Done',
              priority: 'Medium',
              assignee: 'Jane Smith',
              updated: new Date(Date.now() - 86400000).toISOString()
            },
            {
              key: 'PROJ-125',
              summary: 'Add integration with external API',
              status: 'To Do',
              priority: 'High',
              assignee: 'Mike Johnson',
              updated: new Date(Date.now() - 172800000).toISOString()
            }
          ]
        });
      }

      if (githubIntegration) {
        setGithubData({
          gitCommits: [
            {
              sha: 'a1b2c3d4e5f6',
              message: 'feat: Add user profile page',
              author: 'John Doe',
              date: new Date().toISOString()
            },
            {
              sha: 'f6e5d4c3b2a1',
              message: 'fix: Resolve authentication bug',
              author: 'Jane Smith',
              date: new Date(Date.now() - 43200000).toISOString()
            },
            {
              sha: 'b2c3d4e5f6a1',
              message: 'refactor: Improve dashboard performance',
              author: 'Mike Johnson',
              date: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          gitPullRequests: [
            {
              number: 42,
              title: 'Add new authentication system',
              state: 'open',
              author: 'John Doe',
              created: new Date().toISOString()
            },
            {
              number: 41,
              title: 'Update dependencies',
              state: 'merged',
              author: 'Jane Smith',
              created: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        });
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
