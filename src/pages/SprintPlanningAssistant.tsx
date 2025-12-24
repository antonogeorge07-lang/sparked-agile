import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles, Calendar, FileText, CheckCircle2, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/BackButton";

export default function SprintPlanningAssistant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Data states
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [sprintNumber, setSprintNumber] = useState<number>(1);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [startDateTime, setStartDateTime] = useState("");
  
  // JIRA data
  const [backlogItems, setBacklogItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Velocity data (mock - would come from historical data)
  const [velocityData] = useState([
    { sprint: 1, points: 28 },
    { sprint: 2, points: 32 },
    { sprint: 3, points: 30 },
  ]);
  
  // Generated content
  const [sprintGoal, setSprintGoal] = useState("");
  const [storyPointsEstimate, setStoryPointsEstimate] = useState(0);
  const [agenda, setAgenda] = useState("");
  const [discussionTopics, setDiscussionTopics] = useState<string[]>([]);
  
  // Session data
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [outlookEventId, setOutlookEventId] = useState<string | null>(null);
  const [meetingNotes, setMeetingNotes] = useState("");
  
  // Microsoft OAuth
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Handle Microsoft OAuth redirect
    const code = searchParams.get('code');
    if (code) {
      const redirectUri = `${window.location.origin}/sprint-planning-assistant`;
      supabase.functions
        .invoke('get-microsoft-token', { body: { code, redirectUri } })
        .then(({ data, error }) => {
          if (error) throw error;
          // Token is now encrypted and stored in database - no localStorage needed
          toast.success('Connected to Microsoft Outlook');
          checkMicrosoftConnection();
        })
        .catch((e: any) => {
          toast.error(`Microsoft auth failed: ${e.message}`);
        })
        .finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.pathname + (url.search ? '?' + url.searchParams.toString() : ''));
        });
    }

    loadWorkspaces();
    checkMicrosoftConnection();
  }, [searchParams]);

  const checkMicrosoftConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: tokenData } = await supabase
      .from('user_microsoft_tokens')
      .select('is_valid, expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenData?.is_valid && tokenData.expires_at && new Date(tokenData.expires_at) > new Date()) {
      setAccessToken('connected'); // Flag that token exists, actual token retrieved via edge function
    }
  };

  const loadWorkspaces = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projects } = await supabase
      .from("projects")
      .select("id");

    if (!projects || projects.length === 0) return;

    const { data: workspaceData } = await supabase
      .from("project_workspaces")
      .select("*")
      .in("project_id", projects.map(p => p.id))
      .eq("configuration_status", "ready");

    if (workspaceData) {
      setWorkspaces(workspaceData);
      if (workspaceData.length > 0) {
        setSelectedWorkspace(workspaceData[0].id);
      }
    }
  };

  const connectOutlook = async () => {
    try {
      // Get Microsoft Client ID from backend secrets
      const { data, error } = await supabase.functions.invoke("get-microsoft-client-id");
      
      if (error) throw error;
      
      if (!data?.clientId) {
        toast.error("Microsoft credentials not configured. Please contact administrator.");
        return;
      }
      
      const redirectUri = `${window.location.origin}/sprint-planning-assistant`;
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${data.clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent("Calendars.ReadWrite offline_access User.Read")}`;
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error(`Failed to connect: ${error.message}`);
    }
  };

  const fetchBacklog = async () => {
    if (!selectedWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-jira-backlog", {
        body: { workspaceId: selectedWorkspace, maxResults: 20 },
      });

      if (error) throw error;

      setBacklogItems(data.backlogItems || []);
      toast.success(`Loaded ${data.backlogItems?.length || 0} backlog items from JIRA`);
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(`Failed to fetch backlog: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!selectedWorkspace) {
      toast.error("Please select a workspace");
      return;
    }

    setLoading(true);
    try {
      const workspace = workspaces.find(w => w.id === selectedWorkspace);
      
      const { data, error } = await supabase.functions.invoke("generate-sprint-planning", {
        body: {
          sprintNumber,
          backlogItems: selectedItems.length > 0 
            ? backlogItems.filter(item => selectedItems.includes(item.key))
            : backlogItems.slice(0, 10),
          velocityData,
          projectName: workspace?.name || "Project",
          teamSize,
        },
      });

      if (error) throw error;

      setSprintGoal(data.sprintGoal);
      setStoryPointsEstimate(data.storyPointsEstimate);
      setAgenda(data.agenda);
      setDiscussionTopics(data.discussionTopics);

      toast.success("Sprint plan generated successfully!");
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(`Failed to generate plan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createOutlookInvite = async () => {
    if (!accessToken) {
      toast.error("Please connect to Outlook first");
      return;
    }

    if (!startDateTime) {
      toast.error("Please select a meeting date and time");
      return;
    }

    setLoading(true);
    try {
      const workspace = workspaces.find(w => w.id === selectedWorkspace);
      const attendees = workspace?.team_distribution_list?.split(',').map((e: string) => e.trim()) || [];

      const { data, error } = await supabase.functions.invoke("create-sprint-outlook-invite", {
        body: {
          accessToken,
          sprintNumber,
          agenda,
          sprintGoal,
          jiraBacklogUrl: workspace?.jira_board_url,
          attendees,
          startDateTime,
          durationMinutes: 120,
        },
      });

      if (error) throw error;

      setOutlookEventId(data.eventId);
      
      // Create session record
      const { data: { user } } = await supabase.auth.getUser();
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .single();

      if (projects) {
        const { data: session } = await supabase
          .from("sprint_planning_sessions")
          .insert({
            project_id: projects.id,
            workspace_id: selectedWorkspace,
            sprint_number: sprintNumber,
            sprint_goal: sprintGoal,
            velocity_data: velocityData,
            backlog_items: selectedItems.length > 0 
              ? backlogItems.filter(item => selectedItems.includes(item.key))
              : backlogItems.slice(0, 10),
            story_points_estimate: storyPointsEstimate,
            agenda,
            discussion_topics: discussionTopics,
            outlook_event_id: data.eventId,
            created_by: user?.id,
          })
          .select()
          .single();

        if (session) {
          setSessionId(session.id);
        }
      }

      toast.success("Outlook invite created and sent to team!");
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(`Failed to create invite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const recordMinutes = async () => {
    if (!sessionId) {
      toast.error("No session found");
      return;
    }

    setLoading(true);
    try {
      const workspace = workspaces.find(w => w.id === selectedWorkspace);
      const finalizedItems = selectedItems.length > 0 
        ? backlogItems.filter(item => selectedItems.includes(item.key))
        : backlogItems.slice(0, 10);

      const { data, error } = await supabase.functions.invoke("record-sprint-minutes", {
        body: {
          sessionId,
          meetingNotes,
          finalizedItems,
          updateJira: true,
          jiraBoardId: workspace?.jira_board_id,
          jiraSiteUrl: workspace?.jira_board_url?.match(/(https:\/\/[^\/]+)/)?.[1],
        },
      });

      if (error) throw error;

      toast.success("Meeting minutes recorded and JIRA updated!");
      
      // Show success message with option to view
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      toast.error(`Failed to record minutes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemKey: string) => {
    setSelectedItems(prev =>
      prev.includes(itemKey)
        ? prev.filter(k => k !== itemKey)
        : [...prev, itemKey]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary" />
            Sprint Planning Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered sprint planning with JIRA integration and automated Outlook invites
          </p>
        </div>

        {workspaces.length === 0 && (
          <Card className="mb-6 border-warning">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                No configured workspaces found. You need to set up a Project Workspace first with JIRA and GitHub integrations.
              </p>
              <Button onClick={() => navigate("/project-workspace")} variant="outline">
                Go to Project Workspace Setup
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={`step${currentStep}`} onValueChange={(v) => setCurrentStep(parseInt(v.replace("step", "")))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step1">1. Setup</TabsTrigger>
            <TabsTrigger value="step2" disabled={backlogItems.length === 0}>2. Select Items</TabsTrigger>
            <TabsTrigger value="step3" disabled={!agenda}>3. Review Plan</TabsTrigger>
            <TabsTrigger value="step4" disabled={!outlookEventId}>4. Meeting Minutes</TabsTrigger>
          </TabsList>

          <TabsContent value="step1" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Configuration</CardTitle>
                <CardDescription>
                  Select your workspace and configure sprint parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workspace">Project Workspace</Label>
                  <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map(ws => (
                        <SelectItem key={ws.id} value={ws.id}>
                          {ws.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sprintNumber">Sprint Number</Label>
                    <Input
                      id="sprintNumber"
                      type="number"
                      min="1"
                      value={sprintNumber}
                      onChange={(e) => setSprintNumber(parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      min="1"
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recent Velocity</h4>
                  <div className="flex gap-4">
                    {velocityData.map(v => (
                      <div key={v.sprint} className="text-center">
                        <div className="text-2xl font-bold text-primary">{v.points}</div>
                        <div className="text-sm text-muted-foreground">Sprint {v.sprint}</div>
                      </div>
                    ))}
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(velocityData.reduce((sum, v) => sum + v.points, 0) / velocityData.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Average</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Microsoft Outlook</h3>
                    <p className="text-sm text-muted-foreground">
                      Required to create calendar invites
                    </p>
                  </div>
                  {accessToken ? (
                    <CheckCircle2 className="text-success w-6 h-6" />
                  ) : (
                    <Button onClick={connectOutlook} variant="outline">
                      Connect
                    </Button>
                  )}
                </div>

                <Button
                  onClick={fetchBacklog}
                  disabled={loading || !selectedWorkspace}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Backlog...
                    </>
                  ) : (
                    "Fetch JIRA Backlog"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step2" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Backlog Items</CardTitle>
                <CardDescription>
                  Choose items to include in sprint planning ({backlogItems.length} items available)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {backlogItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No backlog items found. Make sure JIRA is connected.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {backlogItems.map(item => (
                      <div
                        key={item.key}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedItems.includes(item.key)
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleItemSelection(item.key)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{item.key}</Badge>
                              {item.priority && (
                                <Badge variant="secondary">{item.priority}</Badge>
                              )}
                              {item.storyPoints > 0 && (
                                <Badge>{item.storyPoints} pts</Badge>
                              )}
                            </div>
                            <h4 className="font-medium">{item.summary}</h4>
                            {item.issueType && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Type: {item.issueType}
                              </p>
                            )}
                          </div>
                          {selectedItems.includes(item.key) && (
                            <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedItems.length > 0 
                      ? `${selectedItems.length} items selected`
                      : 'Select items or use top 10 by default'}
                  </p>
                  <Button
                    onClick={generatePlan}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Sprint Plan with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step3" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Sprint Plan</CardTitle>
                <CardDescription>
                  Review and customize before sending invites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-lg mb-2">🎯 Sprint {sprintNumber} Goal</h3>
                  <p className="text-lg">{sprintGoal}</p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="font-medium">Estimated: {storyPointsEstimate} points</span>
                    <span className="text-muted-foreground">
                      Based on {velocityData.length} sprint velocity
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">📋 Meeting Agenda</h3>
                  <Textarea
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">💡 Discussion Topics</h3>
                  <ul className="space-y-2">
                    {discussionTopics.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="meetingDateTime">Meeting Date & Time</Label>
                  <Input
                    id="meetingDateTime"
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                  />
                </div>

                <Button
                  onClick={createOutlookInvite}
                  disabled={loading || !accessToken || !startDateTime}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Invite...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Create Outlook Invite & Send to Team
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step4" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Meeting Minutes</CardTitle>
                <CardDescription>
                  Document decisions and update JIRA automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="text-success w-5 h-5" />
                    <h3 className="font-semibold">Outlook Invite Sent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Team members have been invited to Sprint {sprintNumber} Planning
                  </p>
                </div>

                <div>
                  <Label htmlFor="meetingNotes">Meeting Notes & Decisions</Label>
                  <Textarea
                    id="meetingNotes"
                    placeholder="Enter key decisions, adjustments to estimates, identified risks, etc..."
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    rows={12}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    AI will format these notes into professional meeting minutes
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">What happens next:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ AI formats notes into structured meeting minutes</li>
                    <li>✓ Sprint commitments saved to database</li>
                    <li>✓ JIRA issues updated with story points</li>
                    <li>✓ Action items tracked automatically</li>
                  </ul>
                </div>

                <Button
                  onClick={recordMinutes}
                  disabled={loading || !meetingNotes.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording & Updating JIRA...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Record Minutes & Update JIRA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}