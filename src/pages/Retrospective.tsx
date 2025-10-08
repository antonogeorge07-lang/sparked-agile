import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Sparkles, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Retrospective() {
  const [wentWell, setWentWell] = useState("");
  const [improve, setImprove] = useState("");
  const [actionItems, setActionItems] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feedback Submitted",
      description: "Your retrospective input has been recorded.",
    });
    setWentWell("");
    setImprove("");
    setActionItems("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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

            <Card className="shadow-card bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Key themes and patterns from team feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-card">
                  <h4 className="font-medium mb-2 text-green-600">Top Positives</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Strong team collaboration (mentioned by 5 members)</li>
                    <li>• Clear sprint goals (mentioned by 4 members)</li>
                    <li>• Improved code quality (mentioned by 3 members)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <h4 className="font-medium mb-2 text-secondary">Areas for Improvement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Meeting efficiency (mentioned by 4 members)</li>
                    <li>• Documentation needs (mentioned by 3 members)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <h4 className="font-medium mb-2 text-primary">Recommended Actions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Implement 15-minute standup time limit</li>
                    <li>2. Create documentation template and guidelines</li>
                    <li>3. Schedule weekly knowledge-sharing sessions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
