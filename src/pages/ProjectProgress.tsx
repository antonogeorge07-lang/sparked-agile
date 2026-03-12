import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, GitBranch, CheckCircle, Clock, Activity, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { IntegrationDataCard } from "@/components/IntegrationDataCard";
import { useIntegrationData } from "@/hooks/useIntegrationData";
import { sampleProjectStats } from "@/data/sampleAnalyticsData";

export default function ProjectProgress() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration } = useIntegrationData(selectedProject);

  useEffect(() => {
    checkAuth();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectStats();
    }
  }, [selectedProject]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    }
  };

  const loadProjectStats = async () => {
    if (!selectedProject) return;

    // Load various project statistics
    const [actionItemsResult, flowMetricsResult, valueStreamsResult] = await Promise.all([
      supabase.from('action_items').select('*').eq('project_id', selectedProject),
      supabase.from('flow_metrics').select('*').eq('project_id', selectedProject).order('metric_date', { ascending: false }).limit(1),
      supabase.from('value_streams').select('*, epics(count)').eq('project_id', selectedProject)
    ]);

    setProjectStats({
      totalActionItems: actionItemsResult.data?.length || 0,
      openActionItems: actionItemsResult.data?.filter(item => item.status === 'open').length || 0,
      latestMetrics: flowMetricsResult.data?.[0] || null,
      valueStreams: valueStreamsResult.data || []
    });
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <BackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Project Progress</h1>
              <p className="text-muted-foreground">Comprehensive view of project status and integration data</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Project</label>
            <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProjectData && (
            <>
              {/* Project Overview */}
              <Card className="shadow-card mb-6">
                <CardHeader>
                  <CardTitle>{selectedProjectData.name}</CardTitle>
                  <CardDescription>{selectedProjectData.description || "No description available"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Action Items</span>
                      </div>
                      <p className="text-2xl font-bold">{projectStats?.totalActionItems || 0}</p>
                      <p className="text-xs text-muted-foreground">{projectStats?.openActionItems || 0} open</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Cycle Time</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {projectStats?.latestMetrics?.cycle_time_avg ? Number(projectStats.latestMetrics.cycle_time_avg).toFixed(1) : '0'}d
                      </p>
                      <p className="text-xs text-muted-foreground">average</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Value Streams</span>
                      </div>
                      <p className="text-2xl font-bold">{projectStats?.valueStreams?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">configured</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Integrations</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(hasJiraIntegration ? 1 : 0) + (hasGithubIntegration ? 1 : 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline View */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Activity Timeline</h2>
                <Card className="shadow-card">
                  <CardContent className="py-6">
                    <div className="space-y-4">
                      {/* Placeholder timeline items - in production, this would show real activity */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <div className="w-0.5 h-full bg-border"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">Project created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedProjectData.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {hasJiraIntegration && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div className="w-0.5 h-full bg-border"></div>
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">JIRA integration connected</p>
                            <p className="text-sm text-muted-foreground">Syncing issues and updates</p>
                          </div>
                        </div>
                      )}

                      {hasGithubIntegration && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            {projectStats && <div className="w-0.5 h-full bg-border"></div>}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">GitHub integration connected</p>
                            <p className="text-sm text-muted-foreground">Tracking commits and pull requests</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Integration Data */}
              {(hasJiraIntegration || hasGithubIntegration) ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Integration Data</h2>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {hasJiraIntegration && jiraData && (
                      <IntegrationDataCard type="jira" data={jiraData} isLoading={isLoading} />
                    )}
                    {hasGithubIntegration && githubData && (
                      <>
                        <IntegrationDataCard type="github" data={{ gitCommits: githubData.gitCommits }} isLoading={isLoading} />
                        <IntegrationDataCard type="github" data={{ gitPullRequests: githubData.gitPullRequests }} isLoading={isLoading} />
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      No integrations connected yet. Connect JIRA or GitHub to see detailed progress data.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
