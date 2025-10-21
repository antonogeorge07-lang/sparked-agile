import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StandupUpdate {
  name: string;
  yesterday: string;
  today: string;
  blockers: string;
}

export default function Standup() {
  const [name, setName] = useState("");
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [teamUpdates, setTeamUpdates] = useState<StandupUpdate[]>([]);
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { toast } = useToast();

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

      // Get user's project
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (project) {
        setSelectedProject(project.id);
        
        // Load existing standup updates for today
        const today = new Date().toISOString().split('T')[0];
        const { data: updates } = await supabase
          .from("standup_updates")
          .select("*, profiles!standup_updates_team_member_id_fkey(full_name)")
          .eq("project_id", project.id)
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);

        if (updates) {
          const formattedUpdates = updates.map(u => ({
            name: u.profiles?.full_name || "Unknown",
            yesterday: u.yesterday,
            today: u.today,
            blockers: u.blockers || "",
          }));
          setTeamUpdates(formattedUpdates);
        }
      }
    };
    loadData();
  }, [toast]);

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
    if (teamUpdates.length === 0) {
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
        body: { updates: teamUpdates }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Summary Generated",
        description: "AI has analyzed the team updates.",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
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
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Daily Standup</h1>
              <p className="text-muted-foreground">Submit your daily update and sync with JIRA</p>
            </div>
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

          <div className="grid gap-6">
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
          </div>
        </div>
      </main>
    </div>
  );
}
