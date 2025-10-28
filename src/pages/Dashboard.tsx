import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { IntegrationBanner } from "@/components/IntegrationBanner";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertCircle, Calendar, Network, FileDown, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationDataCard } from "@/components/IntegrationDataCard";
import { useIntegrationData } from "@/hooks/useIntegrationData";
import { exportDashboardToPowerPoint } from "@/utils/exportToPowerPoint";
import { toast } from "sonner";
import { WorkflowExecutionChart } from "@/components/charts/WorkflowExecutionChart";
import { ActionItemsChart } from "@/components/charts/ActionItemsChart";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";
import { SearchBar } from "@/components/SearchBar";
import { FilterControls } from "@/components/FilterControls";
import { ProjectMemberManager } from "@/components/ProjectMemberManager";
import { HelpTooltip } from "@/components/HelpTooltip";
import { SendReminderDialog } from "@/components/SendReminderDialog";
import { ScheduleReminderDialog } from "@/components/ScheduleReminderDialog";
import { ReminderManagement } from "@/components/ReminderManagement";
import { Bell } from "lucide-react";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration } = useIntegrationData(selectedProject);
  const { activeUsers } = useRealtimePresence('/dashboard');
  const { data: integrations } = useProjectIntegrations(selectedProject || undefined);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    // Only load projects that have integrations
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        integrations!inner(id)
      `)
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
    { id: 3, title: "Database Performance Issues", severity: "high", days: 2 },
    { id: 4, title: "Missing Test Coverage", severity: "low", days: 5 },
  ];

  // Filter impediments based on search and severity
  const filteredImpediments = useMemo(() => {
    return impediments.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || item.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [searchQuery, severityFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (severityFilter !== "all") count++;
    return count;
  }, [severityFilter]);

  const clearFilters = () => {
    setSeverityFilter("all");
    setSearchQuery("");
  };

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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Sprint Health Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Monitor performance with integrations</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Button 
                onClick={() => setShowReminderDialog(true)} 
                className="gap-2 flex-1 sm:flex-none" 
                size="sm"
                variant="outline"
              >
                <Bell className="w-4 h-4" />
                <span className="sm:inline">Send Now</span>
              </Button>
              <Button 
                onClick={() => setShowScheduleDialog(true)} 
                className="gap-2 flex-1 sm:flex-none" 
                size="sm"
              >
                <Calendar className="w-4 h-4" />
                <span className="sm:inline">Schedule</span>
              </Button>
              <Button onClick={handleExportToPowerPoint} className="gap-2 flex-1 sm:flex-none" size="sm" variant="outline">
                <FileDown className="w-4 h-4" />
                <span className="sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {integrations && selectedProject && (
            <IntegrationBanner
              hasJira={integrations.hasJira}
              hasGithub={integrations.hasGithub}
              hasOutlook={integrations.hasOutlook}
            />
          )}

          {selectedProject && projects.length > 0 && (
            <div className="mb-6">
              <ProjectMemberManager
                projectId={selectedProject}
                projectName={projects.find(p => p.id === selectedProject)?.name || "Project"}
              />
            </div>
          )}

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Velocity</CardTitle>
                  <HelpTooltip content="Story points completed in the current sprint, showing team productivity." />
                </div>
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

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Velocity Trend</CardTitle>
                  <HelpTooltip content="Track team velocity over the last 3 sprints to identify patterns and improve planning." />
                </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        Active Impediments
                      </CardTitle>
                      <HelpTooltip content="Track and manage blocking issues to keep sprints on track." />
                    </div>
                    <CardDescription>Issues requiring attention</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="sm:inline">Filter</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showFilters && (
                  <div className="space-y-3 pb-4 border-b">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search impediments..."
                    />
                    <FilterControls
                      filters={[
                        {
                          label: "Severity",
                          value: severityFilter,
                          options: [
                            { label: "All", value: "all" },
                            { label: "High", value: "high" },
                            { label: "Medium", value: "medium" },
                            { label: "Low", value: "low" },
                          ],
                          onChange: setSeverityFilter,
                        },
                      ]}
                      activeFiltersCount={activeFiltersCount}
                      onClearAll={clearFilters}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  {filteredImpediments.length > 0 ? (
                    filteredImpediments.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          item.severity === 'high' ? 'bg-destructive' : 
                          item.severity === 'medium' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">Open for {item.days} days</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No impediments found matching your filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics & Insights Section */}
          <div className="mt-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <WorkflowExecutionChart />
              <ActionItemsChart />
            </div>
          </div>

          {/* Real-time Collaboration Section */}
          {activeUsers.length > 0 && (
            <div className="mt-8 mb-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Real-time Collaboration</CardTitle>
                  <CardDescription>See who's currently active in the workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActiveUsers users={activeUsers} currentPage="/dashboard" variant="full" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Integration Data Section */}
          {(hasJiraIntegration || hasGithubIntegration) && (
            <>
              <div className="flex items-center gap-3 mb-4 mt-8">
                <Network className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Integration Data</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
...
              </div>
            </>
          )}

          {/* Reminder Management Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Ceremony Reminders</h2>
            </div>
            <ReminderManagement projectId={selectedProject || undefined} />
          </div>
        </div>
      </main>

      {selectedProject && projects.length > 0 && (
        <>
          <SendReminderDialog
            open={showReminderDialog}
            onOpenChange={setShowReminderDialog}
            projectId={selectedProject}
            projectName={projects.find(p => p.id === selectedProject)?.name || "Project"}
          />
          <ScheduleReminderDialog
            open={showScheduleDialog}
            onOpenChange={setShowScheduleDialog}
            projects={projects.map(p => ({ id: p.id, name: p.name }))}
            onSuccess={() => {
              setShowScheduleDialog(false);
            }}
          />
        </>
      )}
    </div>
  );
}
