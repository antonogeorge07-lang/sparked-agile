import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, Calendar, Target, ArrowRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Demo() {
  const navigate = useNavigate();

  const demoSteps = [
    {
      icon: MessageSquare,
      title: "Daily Standup",
      description: "Team members submit their updates for what they did yesterday, what they're doing today, and any blockers.",
      features: [
        "AI generates a comprehensive summary of all team updates",
        "Automatically identifies and highlights blockers",
        "Creates actionable items from impediments",
        "Saves time by eliminating lengthy standup meetings"
      ],
      path: "/standup",
      demo: "Try submitting updates like: 'Yesterday I completed the login feature. Today I'm working on the dashboard. Blocked by API access.'"
    },
    {
      icon: BarChart3,
      title: "Sprint Dashboard",
      description: "Get real-time insights into your sprint health and team performance.",
      features: [
        "Track sprint velocity and burndown",
        "Monitor open impediments",
        "View upcoming work and commitments",
        "Visualize team health metrics"
      ],
      path: "/dashboard",
      demo: "View your team's velocity trends, current sprint progress, and identify potential risks early."
    },
    {
      icon: Calendar,
      title: "Sprint Planning",
      description: "AI helps you plan your next sprint based on team capacity and backlog priorities.",
      features: [
        "Input team size and story point capacity",
        "Add backlog items with estimates",
        "AI suggests optimal sprint commitment",
        "Get recommendations on what to defer"
      ],
      path: "/planning",
      demo: "Enter your team size (e.g., 5), capacity (e.g., 40 points), and backlog items to get AI-powered sprint plan suggestions."
    },
    {
      icon: Target,
      title: "Sprint Retrospective",
      description: "Collect anonymous feedback and generate actionable insights for continuous improvement.",
      features: [
        "Anonymous feedback collection",
        "AI identifies common themes",
        "Generates actionable improvement items",
        "Tracks retrospective history"
      ],
      path: "/retrospective",
      demo: "Team members share what went well, what could be improved, and action items. AI synthesizes feedback into themes."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <PlayCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how SM ActiveInteligence streamlines your agile workflow with AI-powered automation
            </p>
          </div>

          <div className="space-y-8">
            {demoSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="shadow-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-base">{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {step.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-sm">Try It Out:</h4>
                      <p className="text-sm text-muted-foreground mb-3">{step.demo}</p>
                      <Button onClick={() => navigate(step.path)} className="gap-2">
                        Try {step.title}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-card bg-gradient-primary/5 border-primary/20 mt-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Ready to Get Started?</CardTitle>
              <CardDescription className="text-center text-base">
                Start with a daily standup and experience the power of AI-assisted agile ceremonies
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" onClick={() => navigate("/standup")} className="gap-2">
                Start Your First Standup
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
