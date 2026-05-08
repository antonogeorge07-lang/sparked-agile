import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useExternalTasks } from "@/hooks/useExternalTasks";
import { JiraTasksPanel } from "@/components/external-tasks/JiraTasksPanel";
import { GitHubIssuesPanel } from "@/components/external-tasks/GitHubIssuesPanel";
import { GitHubPRsPanel } from "@/components/external-tasks/GitHubPRsPanel";
import { SlackChannelPanel } from "@/components/external-tasks/SlackChannelPanel";
import { Button } from "@/components/ui/button";
import { RefreshCw, GitBranch, Bug, GitPullRequest, MessageCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function ExternalTasksHub() {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const navigate = useNavigate();

  const tasks = useExternalTasks(selectedProject);

  useEffect(() => {
    const loadProjects = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingProjects(false);
        return;
      }
      
      const { data } = await supabase
        .from('project_members')
        .select('project_id, projects(id, name)')
        .eq('user_id', user.id);

      const projectList = data?.map(pm => (pm as any).projects).filter(Boolean) || [];
      setProjects(projectList);
      if (projectList.length > 0) setSelectedProject(projectList[0].id);
      setIsLoadingProjects(false);
    };
    loadProjects();
  }, []);

  if (isLoadingProjects) return <DashboardLayout><LoadingState message="Loading projects..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <Helmet>
          <title>External Tasks - Spark-Agile</title>
          <meta name="description" content="View and manage tasks from Jira, GitHub, and other connected tools in one place." />
        </Helmet>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">External Tasks Hub</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage Jira, GitHub, and Slack tasks without leaving Spark-Agile
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/activity-feed')}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Unified Feed</span>
              </Button>
              {projects.length > 1 && (
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => tasks.refreshAll()}
                disabled={tasks.isLoadingJira || tasks.isLoadingGithub}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${(tasks.isLoadingJira || tasks.isLoadingGithub) ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
            </div>
          </div>

          <Tabs defaultValue="jira" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="jira" className="gap-2">
                <Bug className="h-4 w-4" />
                <span className="hidden sm:inline">Jira Issues</span>
                <span className="sm:hidden">Jira</span>
                {tasks.jiraIssues.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{tasks.jiraIssues.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="github-issues" className="gap-2">
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub Issues</span>
                <span className="sm:hidden">Issues</span>
                {tasks.githubIssues.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{tasks.githubIssues.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="github-prs" className="gap-2">
                <GitPullRequest className="h-4 w-4" />
                <span className="hidden sm:inline">Pull Requests</span>
                <span className="sm:hidden">PRs</span>
                {tasks.githubPRs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{tasks.githubPRs.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="slack" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Slack</span>
                <span className="sm:hidden">Slack</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jira">
              <JiraTasksPanel
                issues={tasks.jiraIssues}
                isLoading={tasks.isLoadingJira}
                hasIntegration={tasks.hasJira}
                error={tasks.jiraError}
                onCreateIssue={tasks.createJiraIssue}
                onUpdateIssue={tasks.updateJiraIssue}
                onAddComment={tasks.addJiraComment}
                onRefresh={tasks.fetchJiraIssues}
              />
            </TabsContent>

            <TabsContent value="github-issues">
              <GitHubIssuesPanel
                issues={tasks.githubIssues}
                isLoading={tasks.isLoadingGithub}
                hasIntegration={tasks.hasGithub}
                error={tasks.githubError}
                onCreateIssue={tasks.createGithubIssue}
                onUpdateIssue={tasks.updateGithubIssue}
                onRefresh={tasks.fetchGithubIssues}
              />
            </TabsContent>

            <TabsContent value="github-prs">
              <GitHubPRsPanel
                pullRequests={tasks.githubPRs}
                isLoading={tasks.isLoadingPRs}
                hasIntegration={tasks.hasGithub}
                onRefresh={tasks.fetchGithubPRs}
              />
            </TabsContent>

            <TabsContent value="slack">
              <SlackChannelPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </DashboardLayout>
  );
}