import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Presentation, Calendar, Mail, CheckCircle2, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const MICROSOFT_CLIENT_ID = "YOUR_MICROSOFT_CLIENT_ID"; // Replace with your actual client ID

export default function SprintReviewCoordinator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Configuration
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [sprintNumber, setSprintNumber] = useState<number>(1);
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState("");
  
  // Fetched data
  const [completedTickets, setCompletedTickets] = useState<any[]>([]);
  const [githubCommits, setGithubCommits] = useState<any[]>([]);
  
  // Generated content
  const [achievedObjectives, setAchievedObjectives] = useState("");
  const [demoChecklist, setDemoChecklist] = useState<string[]>([]);
  const [deliveredFeatures, setDeliveredFeatures] = useState<string[]>([]);
  const [fullContent, setFullContent] = useState("");
  
  // Session & meeting
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [outlookEventId, setOutlookEventId] = useState<string | null>(null);
  
  // Post-meeting
  const [stakeholderFeedback, setStakeholderFeedback] = useState("");
  const [backlogUpdates, setBacklogUpdates] = useState("");
  
  // Microsoft OAuth
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
    checkMicrosoftConnection();
  }, []);

  const checkMicrosoftConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: tokenData } = await supabase
      .from('user_microsoft_token_status')
      .select('is_valid, expires_at')
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
      .select("id, name");

    if (!projects || projects.length === 0) return;

    // Projects are the workspace identifier (legacy project_workspaces table removed)
    const synthesized = projects.map((p: any) => ({
      id: p.id,
      project_id: p.id,
      name: p.name,
      configuration_status: "ready",
    }));
    setWorkspaces(synthesized);
    if (synthesized.length > 0) {
      setSelectedWorkspace(synthesized[0].id);
    }
  };

  const connectOutlook = () => {
    const redirectUri = `${window.location.origin}/sprint-review-coordinator`;
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent("Calendars.ReadWrite Mail.Send offline_access User.Read")}`;
    window.location.href = authUrl;
  };

  const fetchCompletedWork = async () => {
    if (!selectedWorkspace || !sprintStartDate || !sprintEndDate) {
      toast.error("Please fill in all sprint details");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-sprint-completed-work", {
        body: {
          workspaceId: selectedWorkspace,
          sprintNumber,
          sprintStartDate,
          sprintEndDate,
        },
      });

      if (error) throw error;

      setCompletedTickets(data.completedTickets || []);
      setGithubCommits(data.githubCommits || []);
      
      toast.success(
        `Loaded ${data.completedTickets?.length || 0} tickets and ${data.githubCommits?.length || 0} commits`
      );
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(`Failed to fetch completed work: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoChecklist = async () => {
    setLoading(true);
    try {
      const workspace = workspaces.find(w => w.id === selectedWorkspace);
      
      const { data, error } = await supabase.functions.invoke("generate-demo-checklist", {
        body: {
          sprintNumber,
          completedTickets,
          githubCommits,
          projectName: workspace?.name || "Project",
        },
      });

      if (error) throw error;

      setAchievedObjectives(data.achievedObjectives);
      setDemoChecklist(data.demoChecklist);
      setDeliveredFeatures(data.deliveredFeatures);
      setFullContent(data.fullContent);

      toast.success("Demo checklist generated successfully!");
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(`Failed to generate checklist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createReviewInvite = async () => {
    if (!accessToken || !meetingDateTime || !stakeholders) {
      toast.error("Please connect to Outlook, set meeting time, and add stakeholders");
      return;
    }

    setLoading(true);
    try {
      const workspace = workspaces.find(w => w.id === selectedWorkspace);
      
      const { data, error } = await supabase.functions.invoke("create-review-outlook-invite", {
        body: {
          accessToken,
          sprintNumber,
          achievedObjectives,
          demoChecklist,
          stakeholders,
          startDateTime: meetingDateTime,
          durationMinutes: 60,
          jiraBoardUrl: workspace?.jira_board_url,
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
          .from("sprint_review_sessions")
          .insert({
            project_id: projects.id,
            workspace_id: selectedWorkspace,
            sprint_number: sprintNumber,
            completed_tickets: completedTickets,
            github_commits: githubCommits,
            demo_checklist: demoChecklist,
            achieved_objectives: achievedObjectives,
            delivered_features: deliveredFeatures,
            outlook_event_id: data.eventId,
            meeting_date: meetingDateTime,
            created_by: user?.id,
          })
          .select()
          .single();

        if (session) {
          setSessionId(session.id);
        }
      }

      toast.success("Sprint Review invite sent to stakeholders!");
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(`Failed to create invite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendWrapup = async () => {
    if (!sessionId) {
      toast.error("No session found");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-review-wrapup", {
        body: {
          sessionId,
          sprintNumber,
          deliveredFeatures,
          stakeholderFeedback,
          backlogUpdates,
          accessToken,
          stakeholders,
        },
      });

      if (error) throw error;

      toast.success("Wrap-up email sent to all stakeholders!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      toast.error(`Failed to send wrap-up: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <Helmet>
        <title>Sprint Review - Spark-Agile</title>
        <meta name="description" content="Coordinate sprint reviews with demo checklists, stakeholder feedback, and completed work summaries." />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-4" />
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Presentation className="w-10 h-10 text-primary" />
            Sprint Review Coordinator
          </h1>
          <p className="text-muted-foreground text-lg">
            Automated demo prep, stakeholder invites, and post-meeting summaries
          </p>
        </div>

        <Tabs value={`step${currentStep}`} onValueChange={(v) => setCurrentStep(parseInt(v.replace("step", "")))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step1">1. Setup</TabsTrigger>
            <TabsTrigger value="step2" disabled={completedTickets.length === 0}>2. Review Work</TabsTrigger>
            <TabsTrigger value="step3" disabled={!achievedObjectives}>3. Demo Prep</TabsTrigger>
            <TabsTrigger value="step4" disabled={!outlookEventId}>4. Wrap-up</TabsTrigger>
          </TabsList>

          <TabsContent value="step1" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Review Configuration</CardTitle>
                <CardDescription>
                  Configure sprint details to fetch completed work
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sprintStartDate">Sprint Start Date</Label>
                    <Input
                      id="sprintStartDate"
                      type="date"
                      value={sprintStartDate}
                      onChange={(e) => setSprintStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sprintEndDate">Sprint End Date</Label>
                    <Input
                      id="sprintEndDate"
                      type="date"
                      value={sprintEndDate}
                      onChange={(e) => setSprintEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Microsoft Outlook & Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Required for invites and wrap-up emails
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
                  onClick={fetchCompletedWork}
                  disabled={loading || !selectedWorkspace || !sprintStartDate || !sprintEndDate}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Completed Work...
                    </>
                  ) : (
                    "Fetch Completed Tickets & Commits"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step2" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Work</CardTitle>
                <CardDescription>
                  Review JIRA tickets and GitHub commits from this sprint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    ✅ Completed JIRA Tickets
                    <Badge>{completedTickets.length}</Badge>
                  </h3>
                  {completedTickets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No completed tickets found</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {completedTickets.map(ticket => (
                        <div key={ticket.key} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{ticket.key}</Badge>
                                {ticket.storyPoints > 0 && (
                                  <Badge>{ticket.storyPoints} pts</Badge>
                                )}
                              </div>
                              <h4 className="font-medium">{ticket.summary}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticket.issueType} • {ticket.status}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0"
                              asChild
                            >
                              <a
                                href={ticket.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    🔨 GitHub Commits
                    <Badge>{githubCommits.length}</Badge>
                  </h3>
                  {githubCommits.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No commits found</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {githubCommits.slice(0, 15).map((commit, idx) => (
                        <div key={idx} className="p-3 border rounded-lg hover:bg-muted">
                          <div className="flex items-start gap-3">
                            <code className="text-xs bg-muted px-2 py-1 rounded">{commit.sha}</code>
                            <div className="flex-1">
                              <p className="text-sm">{commit.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                by {commit.author} • {new Date(commit.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {githubCommits.length > 15 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          + {githubCommits.length - 15} more commits
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={generateDemoChecklist}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Demo Checklist...
                    </>
                  ) : (
                    <>
                      <Presentation className="mr-2 h-4 w-4" />
                      Generate Demo Checklist with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step3" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Demo Preparation</CardTitle>
                <CardDescription>
                  AI-generated demo checklist and meeting invite
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <h3 className="font-semibold mb-2">✅ Achieved Objectives</h3>
                  <p className="text-base">{achievedObjectives}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">📋 Demo Checklist</h3>
                  <ul className="space-y-2">
                    {demoChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 border rounded-lg">
                        <CheckCircle2 className="text-primary w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">🎯 Delivered Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {deliveredFeatures.slice(0, 10).map((feature, idx) => (
                      <Badge key={idx} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="stakeholders">Stakeholder Emails</Label>
                  <Input
                    id="stakeholders"
                    placeholder="Comma-separated: stakeholder1@company.com, stakeholder2@company.com"
                    value={stakeholders}
                    onChange={(e) => setStakeholders(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="meetingDateTime">Review Meeting Date & Time</Label>
                  <Input
                    id="meetingDateTime"
                    type="datetime-local"
                    value={meetingDateTime}
                    onChange={(e) => setMeetingDateTime(e.target.value)}
                  />
                </div>

                <Button
                  onClick={createReviewInvite}
                  disabled={loading || !accessToken || !meetingDateTime || !stakeholders}
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
                      Create & Send Outlook Invite to Stakeholders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step4" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Post-Meeting Wrap-up</CardTitle>
                <CardDescription>
                  Document feedback and send summary to stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="text-success w-5 h-5" />
                    <h3 className="font-semibold">Sprint Review Completed</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Meeting invite sent to stakeholders for Sprint {sprintNumber} Review
                  </p>
                </div>

                <div>
                  <Label htmlFor="stakeholderFeedback">Stakeholder Feedback</Label>
                  <Textarea
                    id="stakeholderFeedback"
                    placeholder="Capture key feedback from stakeholders, questions asked, concerns raised, etc..."
                    value={stakeholderFeedback}
                    onChange={(e) => setStakeholderFeedback(e.target.value)}
                    rows={8}
                  />
                </div>

                <div>
                  <Label htmlFor="backlogUpdates">Backlog Updates & Next Steps</Label>
                  <Textarea
                    id="backlogUpdates"
                    placeholder="Document any backlog changes, new priorities, action items for next sprint..."
                    value={backlogUpdates}
                    onChange={(e) => setBacklogUpdates(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Email will include:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Executive summary of sprint achievements</li>
                    <li>✓ List of delivered features</li>
                    <li>✓ Stakeholder feedback organized by theme</li>
                    <li>✓ Action items and next steps</li>
                    <li>✓ Backlog updates and priorities</li>
                  </ul>
                </div>

                <Button
                  onClick={sendWrapup}
                  disabled={loading || !stakeholderFeedback.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Wrap-up Email...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Wrap-up Email to Stakeholders
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