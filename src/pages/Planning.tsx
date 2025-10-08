import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Sparkles, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Planning() {
  const [teamSize, setTeamSize] = useState("");
  const [capacity, setCapacity] = useState("");
  const [backlogItems, setBacklogItems] = useState("");
  const { toast } = useToast();

  const handleGenerate = () => {
    toast({
      title: "Sprint Plan Generated",
      description: "AI has created a draft sprint plan based on your inputs.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sprint Planning Assistant</h1>
              <p className="text-muted-foreground">Generate AI-powered sprint plans</p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Team Capacity</CardTitle>
                <CardDescription>
                  Enter your team details to generate a sprint plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="team-size">Team Size</Label>
                    <Input
                      id="team-size"
                      type="number"
                      placeholder="5"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Story Points Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="40"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backlog">Backlog Items (one per line)</Label>
                  <textarea
                    id="backlog"
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="User authentication - 8 points&#10;Dashboard redesign - 13 points&#10;API integration - 5 points"
                    value={backlogItems}
                    onChange={(e) => setBacklogItems(e.target.value)}
                  />
                </div>

                <Button onClick={handleGenerate} className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate Sprint Plan with AI
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  AI Suggestions
                </CardTitle>
                <CardDescription>
                  Based on your capacity and backlog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-card">
                  <h4 className="font-medium mb-2">Recommended Sprint Commitment</h4>
                  <p className="text-sm text-muted-foreground">
                    35-40 story points based on team velocity and capacity
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <h4 className="font-medium mb-2">Priority Items</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• User authentication (High priority, 8 points)</li>
                    <li>• API integration (Medium priority, 5 points)</li>
                    <li>• Dashboard redesign (Low priority, 13 points)</li>
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
