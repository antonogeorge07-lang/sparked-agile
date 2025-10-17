import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertCircle, Calendar, Network, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationDataCard } from "@/components/IntegrationDataCard";
import { useIntegrationData } from "@/hooks/useIntegrationData";
import { exportDashboardToPowerPoint } from "@/utils/exportToPowerPoint";
import { toast } from "sonner";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration } = useIntegrationData(selectedProject);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setProjects(data);
      setSelectedProject(data[0].id);
    }
  };

  const velocityData = [
    { sprint: "Sprint 10", points: 32 },
    { sprint: "Sprint 11", points: 28 },
    { sprint: "Sprint 12", points: 35 },
  ];

  const impediments = [
    { id: 1, title: "API Rate Limits", severity: "high", days: 3 },
    { id: 2, title: "Pending Design Review", severity: "medium", days: 1 },
  ];

  const handleExportToPowerPoint = async () => {
    try {
      toast.info("Generating PowerPoint presentation...");
      
      const recentActivity = [
        { title: "Sprint 12 Started", description: "Team began work on new sprint", timestamp: new Date().toISOString() },
        { title: "Standup Completed", description: "Daily sync meeting finished", timestamp: new Date().toISOString() },
      ];

      await exportDashboardToPowerPoint({
        projectName: selectedProject ? projects.find(p => p.id === selectedProject)?.name || "Dashboard" : "All Projects",
        stats: {
          activeProjects: projects.length,
          pendingWorkflows: 5,
          completedActionItems: 12,
        },
        recentActivity,
        jiraIssues: jiraData?.issues,
        gitCommits: githubData?.commits,
      });
      
      toast.success("PowerPoint presentation downloaded successfully!");
    } catch (error) {
      console.error("Error exporting to PowerPoint:", error);
      toast.error("Failed to generate PowerPoint presentation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sprint Health Dashboard</h1>
                <p className="text-muted-foreground">Monitor your team's performance and progress</p>
              </div>
            </div>
            <Button onClick={handleExportToPowerPoint} className="gap-2">
              <FileDown className="w-4 h-4" />
              Export to PowerPoint
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">35</div>
                <p className="text-sm text-muted-foreground mt-1">story points</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+7 from last sprint</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sprint Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68%</div>
                <p className="text-sm text-muted-foreground mt-1">completion rate</p>
                <div className="w-full bg-muted rounded-full h-2 mt-4">
                  <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Days Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-sm text-muted-foreground mt-1">until sprint end</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Ends Dec 15, 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Velocity Trend</CardTitle>
                <CardDescription>Last 3 sprints performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {velocityData.map((sprint, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{sprint.sprint}</span>
                        <span className="text-muted-foreground">{sprint.points} points</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all" 
                          style={{ width: `${(sprint.points / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Active Impediments
                </CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impediments.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        item.severity === 'high' ? 'bg-destructive' : 'bg-secondary'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">Open for {item.days} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Data Section */}
          {(hasJiraIntegration || hasGithubIntegration) && (
            <>
              <div className="flex items-center gap-3 mb-4 mt-8">
                <Network className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Integration Data</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {hasJiraIntegration && jiraData && (
                  <IntegrationDataCard type="jira" data={jiraData} isLoading={isLoading} />
                )}
                {hasGithubIntegration && githubData && (
                  <IntegrationDataCard type="github" data={githubData} isLoading={isLoading} />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
