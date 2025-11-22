import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, GitBranch, BarChart, Calendar, Users, Target } from "lucide-react";

export function FeaturesSection() {
  const featureCategories = [
    {
      category: "AI-Powered Planning",
      features: [
        {
          icon: Sparkles,
          title: "Sprint Planning Assistant",
          description: "Turn 10-hour planning sessions into 2 hours with AI"
        },
        {
          icon: BarChart,
          title: "Smart Backlog Analysis",
          description: "AI spots stale items and suggests priorities"
        }
      ]
    },
    {
      category: "Epic & Project Management",
      features: [
        {
          icon: GitBranch,
          title: "Epic Tracking",
          description: "Manage epics with dependency mapping and progress visualization"
        },
        {
          icon: Target,
          title: "Project Command Centre",
          description: "Centralized view of all projects and team collaboration"
        }
      ]
    },
    {
      category: "Agile Ceremonies",
      features: [
        {
          icon: Calendar,
          title: "Automated Retrospectives",
          description: "Anonymous feedback to AI-powered insights"
        },
        {
          icon: Users,
          title: "Daily Standups",
          description: "Streamlined standups with automated summaries"
        }
      ]
    },
    {
      category: "Integration & Workflows",
      features: [
        {
          icon: Zap,
          title: "Seamless Integrations",
          description: "Connect JIRA, GitHub, and Microsoft 365 in minutes"
        },
        {
          icon: BarChart,
          title: "Team Analytics",
          description: "Track performance and identify bottlenecks"
        }
      ]
    }
  ];

  return (
    <section className="py-20 px-4" aria-labelledby="features-heading">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Agile Teams
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Streamline your agile workflow from planning to delivery
          </p>
        </header>
        
        <div className="space-y-16">
          {featureCategories.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-2xl font-bold mb-6 text-primary">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.features.map((feature, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0"
                          aria-hidden="true"
                        >
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                          <CardDescription className="text-base">{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
