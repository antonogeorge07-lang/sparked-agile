import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Zap, Users, Shield } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Sprint Planning",
      description: "Automatically generate sprint plans from JIRA backlog with velocity-based estimates"
    },
    {
      icon: Target,
      title: "Backlog Refinement",
      description: "AI analyzes backlog health, identifies stale items, and recommends improvements"
    },
    {
      icon: Zap,
      title: "Automated Retrospectives",
      description: "Collect feedback anonymously and generate actionable insights with AI"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time presence, activity tracking, and seamless team coordination"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Row-level security, role-based access control, and encrypted data storage"
    },
    {
      icon: Target,
      title: "JIRA & GitHub Integration",
      description: "Seamless integration with your existing tools and workflows"
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="features-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Agile Excellence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your agile ceremonies and boost team productivity
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {features.map((feature, index) => (
            <Card key={index} className="border-2" role="listitem">
              <CardHeader>
                <div 
                  className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
