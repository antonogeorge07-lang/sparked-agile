import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JiraIssue {
  key: string;
  summary: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  storyPoints: number;
  assignee: string | null;
  issueType: string | null;
  labels: string[];
  url: string;
}

interface GitHubIssue {
  id: number;
  title: string;
  description: string;
  status: string;
  labels: string[];
  assignee: string | null;
  url: string;
  created_at: string;
  updated_at: string;
}

interface GitHubPR {
  number: number;
  title: string;
  body: string;
  state: string;
  draft: boolean;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  url: string;
  head: string;
  base: string;
  labels: string[];
  reviewers: string[];
}

export function useExternalTasks(projectId: string | null) {
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>([]);
  const [githubIssues, setGithubIssues] = useState<GitHubIssue[]>([]);
  const [githubPRs, setGithubPRs] = useState<GitHubPR[]>([]);
  const [isLoadingJira, setIsLoadingJira] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const [hasJira, setHasJira] = useState(false);
  const [hasGithub, setHasGithub] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const checkIntegrations = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('integrations')
      .select('integration_type, is_active, config')
      .eq('project_id', projectId)
      .eq('is_active', true);

    const jira = data?.find(i => i.integration_type === 'jira');
    const github = data?.find(i => i.integration_type === 'github');
    setHasJira(!!jira);
    setHasGithub(!!github);
    return { jira, github };
  }, [projectId]);

  const fetchJiraIssues = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingJira(true);
    setJiraError(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-jira-backlog', {
        body: { projectId, maxResults: 50 }
      });
      if (error) throw error;
      if (data?.needsToken) {
        setJiraError('Jira token not configured');
        return;
      }
      setJiraIssues(data?.backlogItems || []);
    } catch (err: any) {
      setJiraError(err.message || 'Failed to fetch Jira issues');
    } finally {
      setIsLoadingJira(false);
    }
  }, [projectId]);

  const fetchGithubIssues = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingGithub(true);
    setGithubError(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-github-issues', {
        body: { projectId }
      });
      if (error) throw error;
      if (data?.needsToken) {
        setGithubError('GitHub token not configured');
        return;
      }
      setGithubIssues(data?.issues || []);
    } catch (err: any) {
      setGithubError(err.message || 'Failed to fetch GitHub issues');
    } finally {
      setIsLoadingGithub(false);
    }
  }, [projectId]);

  const fetchGithubPRs = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingPRs(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-github-prs', {
        body: { projectId }
      });
      if (error) throw error;
      setGithubPRs(data?.pullRequests || []);
    } catch (err: any) {
      console.error('Failed to fetch PRs:', err);
    } finally {
      setIsLoadingPRs(false);
    }
  }, [projectId]);

  const createJiraIssue = useCallback(async (params: {
    summary: string; description?: string; issueType?: string; priority?: string;
  }) => {
    if (!projectId) return null;
    const { data, error } = await supabase.functions.invoke('create-jira-issue', {
      body: { projectId, ...params }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    toast.success(`Created Jira issue ${data.issue.key}`);
    await fetchJiraIssues();
    return data.issue;
  }, [projectId, fetchJiraIssues]);

  const updateJiraIssue = useCallback(async (issueKey: string, updates: Record<string, any>) => {
    if (!projectId) return;
    const { data, error } = await supabase.functions.invoke('update-jira-issue', {
      body: { projectId, issueKey, updates }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    toast.success(`Updated ${issueKey}`);
    await fetchJiraIssues();
  }, [projectId, fetchJiraIssues]);

  const addJiraComment = useCallback(async (issueKey: string, comment: string) => {
    if (!projectId) return;
    const { data, error } = await supabase.functions.invoke('add-jira-comment', {
      body: { projectId, issueKey, comment }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    toast.success(`Comment added to ${issueKey}`);
  }, [projectId]);

  const createGithubIssue = useCallback(async (params: {
    title: string; body?: string; labels?: string[]; assignees?: string[];
  }) => {
    if (!projectId) return null;
    const { data, error } = await supabase.functions.invoke('create-github-issue', {
      body: { projectId, ...params }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    toast.success(`Created GitHub issue #${data.issue.number}`);
    await fetchGithubIssues();
    return data.issue;
  }, [projectId, fetchGithubIssues]);

  const updateGithubIssue = useCallback(async (issueNumber: number, updates: Record<string, any>) => {
    if (!projectId) return;
    const { data, error } = await supabase.functions.invoke('update-github-issue', {
      body: { projectId, issueNumber, updates }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    toast.success(`Updated GitHub issue #${issueNumber}`);
    await fetchGithubIssues();
  }, [projectId, fetchGithubIssues]);

  const refreshAll = useCallback(async () => {
    const integrations = await checkIntegrations();
    const promises: Promise<void>[] = [];
    if (integrations?.jira) promises.push(fetchJiraIssues());
    if (integrations?.github) {
      promises.push(fetchGithubIssues());
      promises.push(fetchGithubPRs());
    }
    await Promise.all(promises);
  }, [checkIntegrations, fetchJiraIssues, fetchGithubIssues, fetchGithubPRs]);

  useEffect(() => {
    if (projectId) refreshAll();
  }, [projectId]);

  return {
    jiraIssues, githubIssues, githubPRs,
    isLoadingJira, isLoadingGithub, isLoadingPRs,
    hasJira, hasGithub, jiraError, githubError,
    createJiraIssue, updateJiraIssue, addJiraComment,
    createGithubIssue, updateGithubIssue,
    refreshAll, fetchJiraIssues, fetchGithubIssues, fetchGithubPRs,
  };
}
