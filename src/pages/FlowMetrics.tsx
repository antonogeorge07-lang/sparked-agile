import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Clock, Zap, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { IntegrationDataCard } from "@/components/IntegrationDataCard";
import { useIntegrationData } from "@/hooks/useIntegrationData";

export default function FlowMetrics() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration } = useIntegrationData(selectedProject);

  useEffect(() => {
    checkAuth();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMetrics();
    }
  }, [selectedProject]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'pending') {
      toast({
        title: "Account Pending",
        description: "Your account is awaiting admin approval",
        variant: "destructive",
      });
      navigate("/");
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

  const loadMetrics = async () => {
    if (!selectedProject) return;

    const { data, error } = await supabase
      .from('flow_metrics')
      .select('*')
      .eq('project_id', selectedProject)
      .order('metric_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error loading metrics:', error);
    } else {
      setMetrics(data || []);
    }
  };

  const latestMetrics = metrics[0];
  const avgCycleTime = metrics.length > 0 
    ? (metrics.reduce((sum, m) => sum + (Number(m.cycle_time_avg) || 0), 0) / metrics.length).toFixed(1)
    : '0';
  const avgLeadTime = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + (Number(m.lead_time_avg) || 0), 0) / metrics.length).toFixed(1)
    : '0';
  const totalThroughput = metrics.reduce((sum, m) => sum + (m.throughput || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <BackButton className="mb-4" />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Flow Metrics Dashboard</h1>
              <p className="text-muted-foreground">Monitor and optimize your value delivery flow</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Project</label>
            <select
              className="w-full max-w-md px-3 py-2 rounded-md border bg-background"
              value={selectedProject || ""}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Work in Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{latestMetrics?.work_in_progress || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">active items</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cycle Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgCycleTime}</div>
                <p className="text-sm text-muted-foreground mt-1">days</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Start to finish</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Lead Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgLeadTime}</div>
                <p className="text-sm text-muted-foreground mt-1">days</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Request to delivery</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalThroughput}</div>
                <p className="text-sm text-muted-foreground mt-1">items delivered</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <Zap className="w-4 h-4" />
                  <span>Last 30 days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle>Flow Trend Analysis</CardTitle>
              <CardDescription>Track your delivery efficiency over time</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No metrics data available yet. Flow metrics will be captured as you deliver work.
                </p>
              ) : (
                <div className="space-y-4">
                  {metrics.slice(0, 10).map((metric, index) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {new Date(metric.metric_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            WIP: {metric.work_in_progress}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Cycle: {Number(metric.cycle_time_avg).toFixed(1)}d</span>
                          <span>Lead: {Number(metric.lead_time_avg).toFixed(1)}d</span>
                          <span>Throughput: {metric.throughput}</span>
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>Latest</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration Data Section */}
          {(hasJiraIntegration || hasGithubIntegration) && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Network className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Related Integration Data</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {hasJiraIntegration && jiraData && (
                  <IntegrationDataCard type="jira" data={jiraData} isLoading={isLoading} />
                )}
                {hasGithubIntegration && githubData && (
                  <IntegrationDataCard type="github" data={{ gitCommits: githubData.gitCommits }} isLoading={isLoading} />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}