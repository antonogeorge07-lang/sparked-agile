import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Sparkles, Loader2, Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface StandupUpdate {
  id?: string;
  name: string;
  yesterday: string;
  today: string;
  blockers: string;
  created_at?: string;
  team_member_id?: string;
}

interface ActionItem {
  title: string;
  priority: string;
  assignedTo: string;
}

export default function Standup() {
  const [name, setName] = useState("");
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [teamUpdates, setTeamUpdates] = useState<StandupUpdate[]>([]);
  const [todayUpdates, setTodayUpdates] = useState<StandupUpdate[]>([]);
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentTab, setCurrentTab] = useState("my-update");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: integrations } = useProjectIntegrations(selectedProject);

  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use this feature.",
          variant: "destructive",
        });
        return;
      }
      setCurrentUserId(user.id);

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile) {
        setUserProfile(profile);
        setName(profile.full_name || "");
      }

      // Get user's project
      const { data: memberProjects } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user.id)
        .limit(1);

      if (memberProjects && memberProjects.length > 0) {
        setSelectedProject(memberProjects[0].project_id);
      }
    };
    loadData();
  }, [toast]);

  // Load today's team updates when switching to facilitator tab
  useEffect(() => {
    if (currentTab === "facilitator" && selectedProject) {
      loadTodayTeamUpdates();
    }
  }, [currentTab, selectedProject]);

  const loadTodayTeamUpdates = async () => {
    setIsLoadingTeam(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: updates, error } = await supabase
        .from("standup_updates")
        .select("*")
        .eq("project_id", selectedProject)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profile names using teammate safe view - excludes email for privacy
      const userIds = updates?.map(u => u.team_member_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from("profiles_teammate_safe")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const formattedUpdates = updates?.map(update => ({
        id: update.id,
        name: profileMap.get(update.team_member_id) || "Unknown",
        yesterday: update.yesterday,
        today: update.today,
        blockers: update.blockers || "",
        created_at: update.created_at,
        team_member_id: update.team_member_id,
      })) || [];

      setTodayUpdates(formattedUpdates);
    } catch (error: any) {
      console.error("Error loading team updates:", error);
      toast({
        title: "Error",
        description: "Failed to load team updates.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !currentUserId) {
      toast({
        title: "Error",
        description: "Project or user information missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to database
      const { error } = await supabase
        .from("standup_updates")
        .insert({
          project_id: selectedProject,
          team_member_id: currentUserId,
          yesterday,
          today,
          blockers: blockers || null,
        });

      if (error) throw error;

      const newUpdate = { name, yesterday, today, blockers };
      setTeamUpdates([...teamUpdates, newUpdate]);
      
      toast({
        title: "Update Saved",
        description: `${name}'s standup has been saved to the database.`,
      });
      
      setName("");
      setYesterday("");
      setToday("");
      setBlockers("");
    } catch (error: any) {
      console.error("Error saving standup:", error);
      toast({
        title: "Error",
        description: "Failed to save standup update. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSummary = async () => {
    const updates = currentTab === "facilitator" ? todayUpdates : teamUpdates;
    
    if (updates.length === 0) {
      toast({
        title: "No Updates",
        description: "Please add at least one team member's update first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-standup-summary', {
        body: { 
          updates: updates,
          projectId: selectedProject,
          includeActionItems: true
        }
      });

      if (error) throw error;

      setSummary(data.summary);
      if (data.actionItems) {
        setActionItems(data.actionItems);
      }
      
      toast({
        title: "Summary Generated",
        description: "AI has analyzed the team updates and identified action items.",
      });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setTeamUpdates([]);
    setSummary("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <BackButton className="mb-4" />
          <div className="flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold page-header-gradient">Daily Standup Facilitator</h1>
                <p className="text-muted-foreground">Submit updates and manage team standups with AI</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-2">
              <Clock className="w-3 h-3" />
              {format(new Date(), "MMM dd, yyyy")}
            </Badge>
          </div>

          {integrations && selectedProject && (
            <IntegrationStatus
              projectId={selectedProject}
              hasJira={integrations.hasJira}
              hasGithub={integrations.hasGithub}
              hasOutlook={integrations.hasOutlook}
              compact
            />
          )}

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-update" className="gap-2">
                <Send className="w-4 h-4" />
                My Update
              </TabsTrigger>
              <TabsTrigger value="facilitator" className="gap-2">
                <Users className="w-4 h-4" />
                Team Facilitator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-update" className="space-y-6 mt-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Update</CardTitle>
                <CardDescription>
                  Share what you did yesterday, what you're doing today, and any blockers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yesterday">What I did yesterday</Label>
                    <Textarea
                      id="yesterday"
                      placeholder="Completed task reviews, merged PR #234..."
                      value={yesterday}
                      onChange={(e) => setYesterday(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="today">What I will do today</Label>
                    <Textarea
                      id="today"
                      placeholder="Working on feature X, attending design review..."
                      value={today}
                      onChange={(e) => setToday(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blockers">Blockers / Impediments</Label>
                    <Textarea
                      id="blockers"
                      placeholder="Waiting for API access, need review on PR..."
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Submit Update
                  </Button>
                </form>
              </CardContent>
            </Card>

            {teamUpdates.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Team Updates ({teamUpdates.length})</CardTitle>
                  <CardDescription>
                    Updates collected from team members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {teamUpdates.map((update, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="font-medium">{update.name}</p>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleGenerateSummary} 
                      disabled={isGenerating}
                      className="flex-1 gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate AI Summary
                        </>
                      )}
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {summary && (
              <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    AI-Generated Summary
                  </CardTitle>
                  <CardDescription>
                    Powered by Lovable AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {summary}
                  </div>
                </CardContent>
              </Card>
            )}

            {teamUpdates.length === 0 && !summary && (
              <Card className="shadow-card bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    AI Summary
                  </CardTitle>
                  <CardDescription>
                    Add team member updates to generate an AI summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Summary will include:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Team progress highlights</li>
                    <li>Today's focus areas</li>
                    <li>Identified blockers requiring attention</li>
                    <li>Suggested action items</li>
                  </ul>
                </CardContent>
              </Card>
            )}
            </TabsContent>

            <TabsContent value="facilitator" className="space-y-6 mt-6">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Today's Team Updates
                      </CardTitle>
                      <CardDescription>
                        View and manage standup updates from all team members
                      </CardDescription>
                    </div>
                    <Button onClick={loadTodayTeamUpdates} variant="outline" size="sm" disabled={isLoadingTeam}>
                      {isLoadingTeam ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingTeam ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : todayUpdates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No team updates yet today</p>
                      <p className="text-sm mt-1">Updates will appear here as team members submit them</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayUpdates.map((update) => (
                        <Card key={update.id} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{update.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {update.created_at && format(new Date(update.created_at), "HH:mm")}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">✅ Yesterday:</p>
                              <p className="text-foreground">{update.yesterday}</p>
                            </div>
                            <Separator />
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">🎯 Today:</p>
                              <p className="text-foreground">{update.today}</p>
                            </div>
                            {update.blockers && (
                              <>
                                <Separator />
                                <div>
                                  <p className="font-medium text-destructive mb-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Blockers:
                                  </p>
                                  <p className="text-foreground">{update.blockers}</p>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      <div className="pt-4">
                        <Button 
                          onClick={handleGenerateSummary} 
                          disabled={isGenerating}
                          className="w-full gap-2"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating AI Summary...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Generate Team Summary & Action Items
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {summary && (
                <>
                  <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        AI Team Summary
                      </CardTitle>
                      <CardDescription>
                        Powered by Lovable AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {summary}
                      </div>
                    </CardContent>
                  </Card>

                  {actionItems.length > 0 && (
                    <Card className="shadow-card border-secondary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-secondary" />
                          Extracted Action Items
                        </CardTitle>
                        <CardDescription>
                          AI-identified actions from blockers and updates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {actionItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <Badge 
                                variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"}
                                className="mt-0.5"
                              >
                                {item.priority}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">{item.title}</p>
                                {item.assignedTo && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Assigned to: {item.assignedTo}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
