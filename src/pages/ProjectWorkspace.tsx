import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamManagement } from "@/components/TeamManagement";
import { BackButton } from "@/components/BackButton";
import { CelebrationModal } from "@/components/CelebrationModal";
import { ProgressTracker } from "@/components/ProgressTracker";
import { useTranslation } from "react-i18next";

export default function ProjectWorkspace() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Form data
  const [workspaceName, setWorkspaceName] = useState("");
  const [jiraBoardUrl, setJiraBoardUrl] = useState("");
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [teamDistributionList, setTeamDistributionList] = useState("");
  const [startDate, setStartDate] = useState("");

  // Connection status
  const [jiraConnected, setJiraConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [teamsConnected, setTeamsConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationConfig, setCelebrationConfig] = useState({
    title: "",
    description: "",
    nextAction: undefined as { label: string; onClick: () => void } | undefined
  });

  useEffect(() => {
    // Load user's projects
    loadProjects();
    
    // Check if returning from Microsoft OAuth
    const code = searchParams.get("code");
    if (code) {
      handleMicrosoftCallback(code);
    }

    // Check if Microsoft is connected via database (not localStorage for security)
    checkMicrosoftConnection();
    checkGoogleConnection();

    // Check URL params for Google connection success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_connected') === 'true') {
      setGoogleConnected(true);
      toast.success('Google Calendar connected successfully!');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const checkMicrosoftConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: token } = await supabase
      .from('user_microsoft_token_status')
      .select('is_valid, expires_at')
      .maybeSingle();

    if (token && token.is_valid) {
      setOutlookConnected(true);
    }
  };

  const checkGoogleConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_google_tokens')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setGoogleConnected(true);
    }
  };

  const connectGoogle = async () => {
    setGoogleConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in first');
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-oauth-init', {
        body: { redirectUri: window.location.href },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (error: any) {
      console.error('Google connection error:', error);
      toast.error(error.message || 'Failed to start Google connection');
    } finally {
      setGoogleConnecting(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setGoogleConnected(false);
      toast.success('Google account disconnected');
    } catch (error: any) {
      toast.error('Failed to disconnect Google account');
    }
  };

  const loadProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First get user's workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!workspace) {
      toast.error("No workspace found. Please set up your workspace first.");
      navigate("/my-projects");
      return;
    }

    // Then get projects in that workspace
    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("workspace_id", workspace.id)
      .maybeSingle();

    if (projects) {
      setProjectId(projects.id);
    }
  };

  const handleMicrosoftCallback = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/project-workspace`;
      const { data, error } = await supabase.functions.invoke("get-microsoft-token", {
        body: { code, redirectUri },
      });

      if (error) throw error;

      // Token is now encrypted and stored in database - no localStorage needed
      if (data?.success) {
        setOutlookConnected(true);
        toast.success("Connected to Microsoft Outlook & Teams");
        // Clear the code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error: any) {
      toast.error(`Failed to connect: ${error.message}`);
    }
  };

  const connectOutlook = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-microsoft-client-id");
      if (error) throw error;
      if (!data?.clientId) {
        toast.error("Microsoft credentials not configured. Please contact administrator.");
        return;
      }
      const redirectUri = `${window.location.origin}/project-workspace`;
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${data.clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent("Calendars.ReadWrite offline_access User.Read Group.ReadWrite.All Channel.Create")}`;
      window.location.href = authUrl;
    } catch (e: any) {
      toast.error(`Unable to start Microsoft sign-in: ${e.message}`);
    }
  };

  const disconnectOutlook = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete from secure database storage
    await supabase
      .from('user_microsoft_tokens')
      .delete()
      .eq('user_id', user.id);

    setAccessToken(null);
    setOutlookConnected(false);
    toast.success("Disconnected from Microsoft Outlook & Teams");
  };

  const initializeWorkspace = async () => {
    if (!projectId) {
      toast.error("No project found in your workspace. Please create a project from My Workspace first.");
      setTimeout(() => navigate("/my-projects"), 2000);
      return;
    }

    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("initialize-workspace", {
        body: {
          projectId,
          workspaceName,
          teamDistributionList,
          accessToken,
          startDate: startDate || new Date().toISOString().split("T")[0],
        },
      });

      if (error) throw error;

      setWorkspaceId(data.workspaceId);
      toast.success(`Workspace initialized! Created ${data.ceremoniesCreated.length} ceremonies`);
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(`Failed to initialize workspace: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const connectJira = async () => {
    if (!workspaceId) {
      toast.error("Please initialize workspace first");
      return;
    }

    if (!jiraBoardUrl.trim() || !jiraSiteUrl.trim()) {
      toast.error("Please enter JIRA board URL and site URL");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("connect-jira", {
        body: {
          jiraBoardUrl,
          jiraSiteUrl,
          workspaceId,
        },
      });

      if (error) throw error;

      setJiraConnected(true);
      toast.success(`Connected to JIRA board: ${data.boardName}`);
    } catch (error: any) {
      toast.error(`Failed to connect JIRA: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const connectGithub = async () => {
    if (!workspaceId) {
      toast.error("Please initialize workspace first");
      return;
    }

    if (!githubRepoUrl.trim()) {
      toast.error("Please enter GitHub repository URL");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("connect-github", {
        body: {
          githubRepoUrl,
          workspaceId,
        },
      });

      if (error) throw error;

      setGithubConnected(true);
      toast.success(`Connected to GitHub repo: ${data.repoName}`);
    } catch (error: any) {
      toast.error(`Failed to connect GitHub: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupTeamsChannel = async () => {
    if (!workspaceId || !accessToken) {
      toast.error("Please connect to Outlook first");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("setup-teams-channel", {
        body: {
          accessToken,
          workspaceId,
          projectName: workspaceName,
        },
      });

      if (error) throw error;

      setTeamsConnected(true);
      toast.success(`Created Teams channel: ${data.channelName} in ${data.teamName}`);
    } catch (error: any) {
      toast.error(`Failed to setup Teams: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = () => {
    localStorage.setItem("workspace_setup_completed", "true");
    setCelebrationConfig({
      title: "🎉 Workspace Ready!",
      description: "Your project workspace is fully configured and ready for Sprint 1. Let's start building something amazing!",
      nextAction: {
        label: "Go to Dashboard",
        onClick: () => navigate("/dashboard")
      }
    });
    setShowCelebration(true);
  };

  // Progress tracking
  const progressSteps = [
    { id: "workspace", title: "Workspace Created", completed: !!workspaceId },
    { id: "outlook", title: "Outlook Connected", completed: outlookConnected },
    { id: "jira", title: "JIRA Connected", completed: jiraConnected },
    { id: "github", title: "GitHub Connected", completed: githubConnected },
    { id: "google", title: "Google Calendar", completed: googleConnected },
    { id: "teams", title: "Teams Channel Setup", completed: teamsConnected }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Initialize Project Workspace</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Set up your complete Agile project environment with integrated tools and ceremonies
              </p>
            </div>
            <div className="w-full">
              <ProgressTracker steps={progressSteps} currentStep={currentStep - 1} />
            </div>
          </div>
        </div>

        <Tabs value={`step${currentStep}`} onValueChange={(v) => setCurrentStep(parseInt(v.replace("step", "")))}>
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1">
            <TabsTrigger value="step1" className="text-xs sm:text-sm flex items-center justify-center gap-1 h-auto py-2">
              {currentStep > 1 ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <span className="font-semibold">1</span>}
              <span className="hidden sm:inline">Initialize</span>
              <span className="sm:hidden">Init</span>
            </TabsTrigger>
            <TabsTrigger value="step2" disabled={!workspaceId} className="text-xs sm:text-sm flex items-center justify-center gap-1 h-auto py-2">
              {currentStep > 2 ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <span className="font-semibold">2</span>}
              <span className="hidden sm:inline">Connect Tools</span>
              <span className="sm:hidden">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="step3" disabled={!workspaceId} className="text-xs sm:text-sm flex items-center justify-center gap-1 h-auto py-2">
              {currentStep > 3 ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <span className="font-semibold">3</span>}
              <span className="hidden sm:inline">Team Members</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
            <TabsTrigger value="step4" disabled={!workspaceId} className="text-xs sm:text-sm flex items-center justify-center gap-1 h-auto py-2">
              <span className="font-semibold">4</span>
              <span className="hidden sm:inline">Review</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step1" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Details</CardTitle>
                <CardDescription>
                  Set up your project workspace with team members and ceremonies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workspaceName">Project/Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    placeholder="e.g., Q1 Product Launch"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="teamDistributionList">Team Distribution List</Label>
                  <Input
                    id="teamDistributionList"
                    placeholder="Comma-separated emails: user1@company.com, user2@company.com"
                    value={teamDistributionList}
                    onChange={(e) => setTeamDistributionList(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Sprint Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Microsoft Outlook & Teams</h3>
                      <p className="text-sm text-muted-foreground">
                        {outlookConnected 
                          ? "Connected - You can access Outlook and Teams features" 
                          : "Connect to create calendar events and Teams channels"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {outlookConnected ? (
                        <>
                          <CheckCircle2 className="text-success w-6 h-6" />
                          <Button onClick={disconnectOutlook} variant="destructive" size="sm">
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button onClick={connectOutlook} variant="outline">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={initializeWorkspace}
                    disabled={loading || !workspaceName}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      "Initialize Workspace"
                    )}
                  </Button>
                  
                  {!outlookConnected && (
                    <p className="text-sm text-center text-muted-foreground">
                      💡 Outlook connection is optional - you can set it up later
                    </p>
                  )}
                  
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="ghost"
                    className="w-full"
                    disabled={loading}
                  >
                    Skip to Integrations Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step2" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Connect Development Tools</CardTitle>
                <CardDescription>
                  Link your JIRA board, GitHub repository, and Teams channel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">JIRA Board</h3>
                        {jiraConnected && <CheckCircle2 className="text-success w-5 h-5" />}
                      </div>
                      <Input
                        placeholder="JIRA Site URL (e.g., https://yourcompany.atlassian.net)"
                        value={jiraSiteUrl}
                        onChange={(e) => setJiraSiteUrl(e.target.value)}
                        disabled={jiraConnected}
                      />
                      <Input
                        placeholder="Board URL (e.g., https://yourcompany.atlassian.net/jira/software/c/projects/PROJ/boards/1)"
                        value={jiraBoardUrl}
                        onChange={(e) => setJiraBoardUrl(e.target.value)}
                        disabled={jiraConnected}
                      />
                      <Button
                        onClick={connectJira}
                        disabled={loading || jiraConnected || !jiraBoardUrl || !jiraSiteUrl}
                        variant="outline"
                        className="w-full"
                      >
                        {jiraConnected ? "Connected" : "Connect JIRA"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">GitHub Repository</h3>
                        {githubConnected && <CheckCircle2 className="text-success w-5 h-5" />}
                      </div>
                      <Input
                        placeholder="Repository URL (e.g., https://github.com/username/repo)"
                        value={githubRepoUrl}
                        onChange={(e) => setGithubRepoUrl(e.target.value)}
                        disabled={githubConnected}
                      />
                      <Button
                        onClick={connectGithub}
                        disabled={loading || githubConnected || !githubRepoUrl}
                        variant="outline"
                        className="w-full"
                      >
                        {githubConnected ? "Connected" : "Connect GitHub"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Microsoft Teams Channel</h3>
                        {teamsConnected && <CheckCircle2 className="text-success w-5 h-5" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Create a dedicated Teams channel for project communication
                      </p>
                      <Button
                        onClick={setupTeamsChannel}
                        disabled={loading || teamsConnected || !accessToken}
                        variant="outline"
                        className="w-full"
                      >
                        {teamsConnected ? "Channel Created" : "Setup Teams Channel"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Google Calendar</h3>
                        {googleConnected && <CheckCircle2 className="text-success w-5 h-5" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {googleConnected
                          ? "Connected - ceremonies will sync to your Google Calendar"
                          : "Sync sprint ceremonies and meetings with Google Calendar"
                        }
                      </p>
                      {googleConnected ? (
                        <Button onClick={disconnectGoogle} variant="destructive" size="sm">
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          onClick={connectGoogle}
                          disabled={googleConnecting}
                          variant="outline"
                          className="w-full"
                        >
                          {googleConnecting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            "Connect Google Calendar"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="w-full"
                    size="lg"
                  >
                    Continue to Team Management
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentStep(4)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Skip to Review (Optional integrations)
                  </Button>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    💡 All tool integrations are optional and can be configured later
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step3" className="space-y-6 mt-6">
            {projectId && workspaceName && (
              <TeamManagement
                projectId={projectId}
                projectName={workspaceName}
                accessToken={accessToken || undefined}
              />
            )}
            <Button
              onClick={() => setCurrentStep(4)}
              className="w-full"
              size="lg"
            >
              Continue to Review
            </Button>
          </TabsContent>

          <TabsContent value="step4" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
                <CardDescription>Review your workspace setup and complete initialization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="text-success w-5 h-5" />
                    <div>
                      <p className="font-medium">Workspace Created</p>
                      <p className="text-sm text-muted-foreground">{workspaceName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {outlookConnected ? (
                      <CheckCircle2 className="text-success w-5 h-5" />
                    ) : (
                      <AlertCircle className="text-warning w-5 h-5" />
                    )}
                    <div>
                      <p className="font-medium">Outlook Ceremonies</p>
                      <p className="text-sm text-muted-foreground">
                        5 Scrum ceremonies scheduled
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {jiraConnected ? (
                      <CheckCircle2 className="text-success w-5 h-5" />
                    ) : (
                      <AlertCircle className="text-muted-foreground w-5 h-5" />
                    )}
                    <div>
                      <p className="font-medium">JIRA Integration</p>
                      <p className="text-sm text-muted-foreground">
                        {jiraConnected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {githubConnected ? (
                      <CheckCircle2 className="text-success w-5 h-5" />
                    ) : (
                      <AlertCircle className="text-muted-foreground w-5 h-5" />
                    )}
                    <div>
                      <p className="font-medium">GitHub Integration</p>
                      <p className="text-sm text-muted-foreground">
                        {githubConnected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {teamsConnected ? (
                      <CheckCircle2 className="text-success w-5 h-5" />
                    ) : (
                      <AlertCircle className="text-muted-foreground w-5 h-5" />
                    )}
                    <div>
                      <p className="font-medium">Teams Channel</p>
                      <p className="text-sm text-muted-foreground">
                        {teamsConnected ? "Channel created" : "Not setup"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">✅ Workspace Ready for Sprint 1</p>
                  <p className="text-sm text-muted-foreground">
                    Your team members have been invited to all ceremonies. Check your Outlook
                    calendar for scheduled events and Teams for the project channel.
                  </p>
                </div>

                <Button onClick={completeSetup} className="w-full" size="lg">
                  Complete Setup & Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={celebrationConfig.title}
        description={celebrationConfig.description}
        nextAction={celebrationConfig.nextAction}
      />
    </div>
  );
}