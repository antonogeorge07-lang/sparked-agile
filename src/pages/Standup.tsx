import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Standup() {
  const [name, setName] = useState("");
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Standup Submitted",
      description: "Your update has been recorded and will be included in the summary.",
    });
    setName("");
    setYesterday("");
    setToday("");
    setBlockers("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Daily Standup</h1>
              <p className="text-muted-foreground">Submit your daily update</p>
            </div>
          </div>

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

            <Card className="shadow-card bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  AI Summary
                </CardTitle>
                <CardDescription>
                  Once all team members submit, an AI-generated summary will appear here
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
          </div>
        </div>
      </main>
    </div>
  );
}
