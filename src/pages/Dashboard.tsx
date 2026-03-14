import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { IntegrationBanner } from "@/components/IntegrationBanner";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertCircle, Calendar, Network, FileDown, Filter, Lightbulb } from "lucide-react";
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
import { SmartFeedbackTrigger } from "@/components/SmartFeedbackTrigger";
import { CeremonyHealthCheck } from "@/components/CeremonyHealthCheck";
import { SendReminderDialog } from "@/components/SendReminderDialog";
import { ScheduleReminderDialog } from "@/components/ScheduleReminderDialog";
import { ReminderManagement } from "@/components/ReminderManagement";
import { Bell, GitBranch } from "lucide-react";
import { GitHubActivityCard } from "@/components/GitHubActivityCard";
import { EpicDashboardWidget } from "@/components/epic/EpicDashboardWidget";
import { IntegrationSettings } from "@/components/IntegrationSettings";
import { SmartNudgesPanel } from "@/components/SmartNudgesPanel";
import { GuestModeBar } from "@/components/GuestModeBar";
import { useGuestMode } from "@/hooks/useGuestMode";
import { GuestNavigationCards, GuestWelcomeBanner } from "@/components/GuestNavigationCards";
import { LoadingState } from "@/components/LoadingState";
import { FirstProjectPrompt } from "@/components/FirstProjectPrompt";
import { 
  sampleVelocityData, 
  sampleImpediments, 
  sampleCurrentVelocity,
  sampleSprintProgress,
  sampleDaysRemaining,
  sampleInsights
} from "@/data/sampleDashboardData";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration, refresh: refreshIntegrations } = useIntegrationData(selectedProject);
  const { activeUsers } = useRealtimePresence('/dashboard');
  const { data: integrations } = useProjectIntegrations(selectedProject || undefined);
  const { isGuestMode } = useGuestMode();

  // Use sample data if no integrations or in guest mode
  const showSampleData = isGuestMode || (!hasJiraIntegration && !hasGithubIntegration);

  // Handle Microsoft OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleMicrosoftCallback(code);
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams]);

  const handleMicrosoftCallback = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.functions.invoke("get-microsoft-token", {
        body: { code, redirectUri },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Connected to Microsoft as ${data.userEmail || 'user'}`);
        refreshIntegrations();
      }
    } catch (error: any) {
      toast.error(`Microsoft connection failed: ${error.message}`);
    }
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isGuestMode) {
        navigate("/auth");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && !isGuestMode) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isGuestMode]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // Load all projects (not just those with integrations)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProject(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast.error("Failed to load projects", {
        description: error.message || "Please refresh the page to try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const velocityData = showSampleData ? sampleVelocityData : [];
  const impediments = showSampleData ? sampleImpediments : [];

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
    <DashboardLayout>
      {isGuestMode && <GuestModeBar />}
      <SmartFeedbackTrigger />
      
      {isLoadingProjects ? (
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading dashboard..." size="lg" />
        </div>
      ) : (
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {isGuestMode && (
            <>
              <GuestWelcomeBanner />
              <GuestNavigationCards />
            </>
          )}
          
          {!isGuestMode && <CeremonyHealthCheck />}

          {/* First project prompt for users with zero projects */}
          {!isGuestMode && !isLoadingProjects && projects.length === 0 && (
            <FirstProjectPrompt onProjectCreated={loadProjects} />
          )}
          
          <BackButton className="mb-4" />
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row items-start sm:items-center justify-between animate-fade-in mb-4 sm:mb-0">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">Sprint Health Dashboard</h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground truncate">Monitor performance with integrations</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setShowReminderDialog(true)} 
                className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm" 
                size="sm"
                variant="outline"
              >
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Send</span>
              </Button>
              <Button 
                onClick={() => setShowScheduleDialog(true)} 
                className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm" 
                size="sm"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Schedule</span>
              </Button>
              <Button onClick={handleExportToPowerPoint} className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm" size="sm" variant="outline">
                <FileDown className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">PPT</span>
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
                {showSampleData ? (
                  <>
                    <div className="text-3xl font-bold text-primary">{sampleCurrentVelocity}</div>
                    <p className="text-sm text-success mt-1">+12% from last sprint</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-muted-foreground">--</div>
                    <p className="text-sm text-muted-foreground mt-1">Connect integrations to see data</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sprint Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {showSampleData ? (
                  <>
                    <div className="text-3xl font-bold text-primary">{sampleSprintProgress}%</div>
                    <p className="text-sm text-muted-foreground mt-1">On track for sprint goal</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-muted-foreground">--</div>
                    <p className="text-sm text-muted-foreground mt-1">Connect integrations to see data</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Days Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                {showSampleData ? (
                  <>
                    <div className="text-3xl font-bold text-primary">{sampleDaysRemaining}</div>
                    <p className="text-sm text-muted-foreground mt-1">Until sprint end</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-muted-foreground">--</div>
                    <p className="text-sm text-muted-foreground mt-1">Connect integrations to see data</p>
                  </>
                )}
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
                {velocityData.length > 0 ? (
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
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No velocity data available</p>
                    <p className="text-sm mt-1">Connect integrations to track sprint velocity</p>
                  </div>
                )}
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

          {/* Integration Data - Jira & GitHub */}
          {selectedProject && (hasJiraIntegration || hasGithubIntegration) && (
            <div className="mt-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Live Integration Data</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {hasJiraIntegration && jiraData && (
                  <IntegrationDataCard type="jira" data={jiraData} isLoading={isLoading} />
                )}
                {hasGithubIntegration && githubData && (
                  <IntegrationDataCard type="github" data={githubData} isLoading={isLoading} />
                )}
              </div>
            </div>
          )}

          {/* GitHub Activity Card */}
          {selectedProject && (
            <div className="mb-6">
              <GitHubActivityCard projectId={selectedProject} />
            </div>
          )}

          {/* Analytics & Insights Section */}
          <div className="mt-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <WorkflowExecutionChart />
              <ActionItemsChart />
            </div>
          </div>

          {/* Smart Nudges */}
          {!isGuestMode && selectedProject && (
            <div className="mt-8 mb-6">
              <SmartNudgesPanel projectId={selectedProject} />
            </div>
          )}

          {/* Epic Health Widget */}
          <div className="mt-8 mb-6">
            <EpicDashboardWidget />
          </div>

          {/* Quick Wins - Sample Insights Section */}
          {showSampleData && (
            <div className="mt-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Quick Insights</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sampleInsights.map((insight, index) => (
                  <Card key={index} className="shadow-card hover-scale">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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

          {/* Integration Settings Section - Easy Connect */}
          <div className="mt-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <IntegrationSettings projectId={selectedProject} />
              
              {/* Integration Status */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Integration Status
                  </CardTitle>
                  <CardDescription>Connected integrations for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <IntegrationStatus
                    hasJira={hasJiraIntegration}
                    hasGithub={hasGithubIntegration}
                    hasOutlook={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>


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
      )}

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
    </DashboardLayout>
  );
}
