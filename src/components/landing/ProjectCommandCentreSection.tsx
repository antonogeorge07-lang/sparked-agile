import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ProjectCommandCentreSection() {
  const features = [
    {
      icon: Target,
      title: "Aligned with PMP Principles",
      description: "Manage projects through complete PMI lifecycle stages from initiation to closure"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations and risk analysis powered by advanced AI"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage up to 5 projects with team members and use PolyLinQ for seamless communication"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" aria-labelledby="command-centre-heading">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" aria-hidden="true" />
      <div className="container mx-auto max-w-5xl relative">
        <header className="text-center mb-8 space-y-4">
          <Badge className="gap-2" variant="secondary">
            <Sparkles className="h-3 w-3 animate-pulse" aria-hidden="true" />
            New Feature
          </Badge>
          <h2 id="command-centre-heading" className="text-4xl md:text-5xl font-bold">
            Project Command Centre
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for Traditional Project Management • Futuristic, AI-Ready Design
          </p>
        </header>

        <Card className="border-2 border-primary/20 shadow-elegant overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-4" role="list">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-3 items-start" role="listitem">
                      <div 
                        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                        aria-hidden="true"
                      >
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link to="/auth">
                    <Button 
                      size="lg" 
                      className="gap-2 w-full md:w-auto"
                      aria-label="Access the Project Command Centre"
                    >
                      Access Command Centre
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div 
                  className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30"
                  role="img"
                  aria-label="Project Command Centre interface showing Kanban board, task management, and progress tracking features"
                >
                  <div className="text-center space-y-2 p-8">
                    <Target className="h-16 w-16 mx-auto text-primary opacity-80" aria-hidden="true" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Kanban Board • Task Management • Progress Tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
