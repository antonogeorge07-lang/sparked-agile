import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { WorkflowExecutionChart } from "@/components/charts/WorkflowExecutionChart";
import { ActionItemsChart } from "@/components/charts/ActionItemsChart";

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
  const { toast } = useToast();
  const navigate = useNavigate();

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

    // Check if user is approved
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

    const { data, error } = await supabase
      .from('projects')
      .insert({ 
        name: projectName, 
        description: 'AI Workflow Project',
        user_id: user.id
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
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Workflow Automation</h1>
              <p className="text-muted-foreground">Process team data through AI and automate actions</p>
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
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Create Project</CardTitle>
                    <CardDescription>Start by creating a project to organize your workflows</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="My Agile Team"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>
                    <Button onClick={createProject} className="w-full">
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
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
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Action Items
                    </CardTitle>
                    <CardDescription>AI-extracted tasks and blockers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {actionItems.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                            item.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                            item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {item.priority}
                          </div>
                        </div>
                      </div>
                    ))}
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
