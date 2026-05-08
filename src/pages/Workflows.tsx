import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2, CheckCircle, AlertCircle, Clock, Filter, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { WorkflowExecutionChart } from "@/components/charts/WorkflowExecutionChart";
import { ActionItemsChart } from "@/components/charts/ActionItemsChart";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";
import { SearchBar } from "@/components/SearchBar";
import { FilterControls } from "@/components/FilterControls";
import { useProjectLimits } from "@/hooks/useProjectLimits";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface ActionItem {
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function Workflows() {
  const [user, setUser] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState("standup_analysis");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeUsers } = useRealtimePresence('/workflows');
  const { currentCount, limitCount, canCreate, tierName, refresh: refreshLimits } = useProjectLimits();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadActionItems();
    }
  }, [projectId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }


    setUser(session.user);
  };

  const loadActionItems = async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading action items:', error);
    } else {
      setActionItems(data || []);
    }
  };

  const createProject = async () => {
    if (!projectName) {
      toast({
        title: "Project name required",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user can create more projects
    if (!canCreate) {
      toast({
        title: "Project Limit Reached",
        description: `You've reached your ${tierName} plan limit of ${limitCount} projects. Upgrade to create more!`,
        variant: "destructive",
      });
      return;
    }

    // Get user's workspace - required for RLS policies
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      toast({
        title: "Error",
        description: "Please ensure you have a workspace created first.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({ 
        name: projectName, 
        description: 'AI Workflow Project',
        user_id: user.id,
        workspace_id: workspace.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } else {
      // Also add user as project member
      await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      setProjectId(data.id);
      await refreshLimits();
      toast({
        title: "Project Created",
        description: `Project "${projectName}" created successfully`,
      });
    }
  };

  const processWorkflow = async () => {
    if (!projectId) {
      toast({
        title: "No Project Selected",
        description: "Please create a project first",
        variant: "destructive",
      });
      return;
    }

    if (!inputText) {
      toast({
        title: "Missing Input",
        description: "Please provide input data for the workflow",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      let inputData;
      if (workflowType === 'standup_analysis') {
        inputData = { updates: inputText.split('\n').filter(line => line.trim()) };
      } else {
        inputData = { summary: inputText };
      }

      const { data, error } = await supabase.functions.invoke('process-workflow', {
        body: {
          workflowType,
          projectId,
          inputData
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Workflow processing failed');
      }

      setResult(data.result);
      await loadActionItems();

      toast({
        title: "Workflow Complete",
        description: `Processed in ${data.executionTime}ms. Generated ${data.actionItems?.length || 0} action items.`,
      });
    } catch (error) {
      console.error('Workflow error:', error);
      toast({
        title: "Workflow Failed",
        description: error instanceof Error ? error.message : "Failed to process workflow",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter action items based on search and filters
  const filteredActionItems = useMemo(() => {
    return actionItems.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [actionItems, searchQuery, priorityFilter, statusFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priorityFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [priorityFilter, statusFilter]);

  const clearFilters = () => {
    setPriorityFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const getExampleInput = () => {
    switch (workflowType) {
      case 'standup_analysis':
        return "John: Yesterday I completed the login feature. Today working on dashboard. Blocked by API access.\nSarah: Yesterday fixed bugs. Today implementing tests. No blockers.\nMike: Yesterday started new feature. Today continuing work. Waiting for design approval.";
      case 'sprint_extraction':
        return "Sprint 5 completed with 42 story points. Team delivered user authentication, dashboard redesign, and API integration. Key blocker was database migration delay.";
      case 'retro_insights':
        return "What went well: Good collaboration, fast bug fixes\nWhat could improve: Need better documentation, more testing time\nAction items: Set up automated tests, create wiki";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Workflows - Spark-Agile</title>
        <meta name="description" content="Automate agile ceremonies and project workflows with AI-powered orchestration." />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-6 sm:mb-8 animate-fade-in">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AI Workflow Automation</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Process team data through AI</p>
            </div>
          </div>

          {projectId && (
            <div className="mb-8 space-y-6">
              <h2 className="text-2xl font-bold">Performance Analytics</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <WorkflowExecutionChart />
                <ActionItemsChart />
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-6">
              {!projectId ? (
                <>
                  {/* Project Limit Alert */}
                  {!canCreate && currentCount !== undefined && limitCount !== undefined && (
                    <Alert className="mb-4 border-primary/50 bg-primary/10">
                      <Crown className="h-4 w-4" />
                      <AlertTitle>Project Limit Reached</AlertTitle>
                      <AlertDescription>
                        You've reached your {tierName} plan limit of {limitCount} projects ({currentCount}/{limitCount}).
                        <Link to="/subscription" className="font-medium underline ml-1">
                          Upgrade now
                        </Link> to create more projects!
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Create Project</CardTitle>
                      <CardDescription>
                        {currentCount !== undefined && limitCount !== undefined && (
                          <span className="text-sm">
                            {currentCount}/{limitCount} projects used on {tierName} plan
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          placeholder="My Agile Team"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          disabled={!canCreate}
                        />
                      </div>
                      <Button 
                        onClick={createProject} 
                        className="w-full"
                        disabled={!canCreate}
                      >
                        {!canCreate ? 'Upgrade to Create More' : 'Create Project'}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Project: {projectName}
                      </CardTitle>
                      <CardDescription>Configure and run AI workflows</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Workflow Configuration</CardTitle>
                      <CardDescription>Select workflow type and provide input data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Workflow Type</Label>
                        <Select value={workflowType} onValueChange={setWorkflowType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standup_analysis">Standup Analysis</SelectItem>
                            <SelectItem value="sprint_extraction">Sprint Summary</SelectItem>
                            <SelectItem value="retro_insights">Retrospective Insights</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="input-data">Input Data</Label>
                        <Textarea
                          id="input-data"
                          placeholder={getExampleInput()}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>

                      <Button 
                        onClick={processWorkflow} 
                        disabled={isProcessing}
                        className="w-full gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Run AI Workflow
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && (
                <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      AI Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.key_achievements && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Achievements:</h4>
                        <ul className="space-y-1">
                          {result.key_achievements.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.blockers_identified && (
                      <div>
                        <h4 className="font-semibold mb-2">Blockers Identified:</h4>
                        <ul className="space-y-1">
                          {result.blockers_identified.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-destructive">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.ai_insights && (
                      <div>
                        <h4 className="font-semibold mb-2">AI Insights:</h4>
                        <p className="text-sm text-muted-foreground">{result.ai_insights}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {actionItems.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          Action Items ({filteredActionItems.length})
                        </CardTitle>
                        <CardDescription>AI-extracted tasks and blockers</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showFilters && (
                      <div className="space-y-3 pb-4 border-b">
                        <SearchBar
                          value={searchQuery}
                          onChange={setSearchQuery}
                          placeholder="Search action items..."
                        />
                        <FilterControls
                          filters={[
                            {
                              label: "Priority",
                              value: priorityFilter,
                              options: [
                                { label: "All", value: "all" },
                                { label: "Critical", value: "critical" },
                                { label: "High", value: "high" },
                                { label: "Medium", value: "medium" },
                                { label: "Low", value: "low" },
                              ],
                              onChange: setPriorityFilter,
                            },
                            {
                              label: "Status",
                              value: statusFilter,
                              options: [
                                { label: "All", value: "all" },
                                { label: "Open", value: "open" },
                                { label: "In Progress", value: "in_progress" },
                                { label: "Completed", value: "completed" },
                              ],
                              onChange: setStatusFilter,
                            },
                          ]}
                          activeFiltersCount={activeFiltersCount}
                          onClearAll={clearFilters}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {filteredActionItems.length > 0 ? (
                        filteredActionItems.map((item, index) => (
                          <div key={index} className="p-3 rounded-lg border bg-card">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.title}</h4>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  item.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                                  item.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                  item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                  'bg-blue-500/20 text-blue-500'
                                }`}>
                                  {item.priority}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  item.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                  item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' :
                                  'bg-gray-500/20 text-gray-500'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {actionItems.length === 0 
                            ? "No action items yet. Run a workflow to generate some."
                            : "No action items found matching your filters"
                          }
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!result && !isProcessing && projectId && (
                <Card className="shadow-card bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      Waiting for Input
                    </CardTitle>
                    <CardDescription>
                      Configure your workflow and run it to see AI-generated insights and action items
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
