import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Sparkles, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { useUserRole } from "@/hooks/useUserRole";
import { PendingApprovalBanner } from "@/components/PendingApprovalBanner";

interface FeedbackItem {
  wentWell: string;
  improve: string;
  actionItems: string;
}

export default function Retrospective() {
  const { isPending } = useUserRole();
  const [wentWell, setWentWell] = useState("");
  const [improve, setImprove] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [insights, setInsights] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { toast } = useToast();

  const { data: integrations } = useProjectIntegrations(selectedProject);

  useEffect(() => {
    const loadProject = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .limit(1)
        .single();
      if (data) setSelectedProject(data.id);
    };
    loadProject();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFeedback = { wentWell, improve, actionItems };
    setFeedback([...feedback, newFeedback]);
    
    toast({
      title: "Feedback Added",
      description: "Your feedback has been recorded. Add more or generate insights.",
    });
    
    setWentWell("");
    setImprove("");
    setActionItems("");
  };

  const handleGenerateInsights = async () => {
    if (feedback.length === 0) {
      toast({
        title: "No Feedback",
        description: "Please add at least one feedback item first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-retro-insights', {
        body: { feedback }
      });

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: "Insights Generated",
        description: "AI has analyzed the retrospective feedback.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setFeedback([]);
    setInsights("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      {isPending && <PendingApprovalBanner />}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sprint Retrospective</h1>
              <p className="text-muted-foreground">Reflect and improve as a team</p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Feedback</CardTitle>
                <CardDescription>
                  Share your thoughts anonymously about the sprint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="went-well">What went well?</Label>
                    <Textarea
                      id="went-well"
                      placeholder="Team collaboration was excellent, completed all planned items..."
                      value={wentWell}
                      onChange={(e) => setWentWell(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="improve">What could be improved?</Label>
                    <Textarea
                      id="improve"
                      placeholder="Daily standups could be more focused, need better documentation..."
                      value={improve}
                      onChange={(e) => setImprove(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actions">Suggested action items</Label>
                    <Textarea
                      id="actions"
                      placeholder="Implement a standup timer, create a documentation template..."
                      value={actionItems}
                      onChange={(e) => setActionItems(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>

            {feedback.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Collected Feedback ({feedback.length})</CardTitle>
                  <CardDescription>
                    Anonymous feedback from team members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {feedback.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="font-medium">Feedback {index + 1}</p>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleGenerateInsights} 
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
                          Generate AI Insights
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

            {insights && (
              <Card className="shadow-card bg-gradient-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>
                    Powered by Lovable AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {insights}
                  </div>
                </CardContent>
              </Card>
            )}

            {feedback.length === 0 && !insights && (
              <Card className="shadow-card bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>
                    Add feedback to generate AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-card">
                    <h4 className="font-medium mb-2">What You'll Get</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Top positive themes from feedback</li>
                      <li>• Key areas for improvement</li>
                      <li>• Specific, actionable recommendations</li>
                      <li>• Overall team health assessment</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
