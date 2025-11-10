import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Zap, Users, Shield, GitBranch, BarChart } from "lucide-react";

export function FeaturesSection() {
  const featureCategories = [
    {
      category: "Planning",
      features: [
        {
          icon: Sparkles,
          title: "AI Sprint Planning",
          description: "Generate sprint plans from JIRA backlog in minutes, not hours"
        },
        {
          icon: Target,
          title: "Smart Backlog Prioritization",
          description: "AI identifies stale items and recommends what to tackle next"
        }
      ]
    },
    {
      category: "Execution & Visibility",
      features: [
        {
          icon: Users,
          title: "Real-Time Team Sync",
          description: "Live presence tracking and seamless coordination"
        },
        {
          icon: GitBranch,
          title: "JIRA & GitHub Integration",
          description: "Connect your tools in 2 minutes, no complex setup"
        }
      ]
    },
    {
      category: "Insights & Retrospectives",
      features: [
        {
          icon: Zap,
          title: "Automated Retros",
          description: "Collect anonymous feedback and get AI-generated insights"
        },
        {
          icon: BarChart,
          title: "Team Performance Analytics",
          description: "Track velocity, burndown, and delivery trends"
        }
      ]
    },
    {
      category: "Security & Setup",
      features: [
        {
          icon: Shield,
          title: "Enterprise-Grade Security",
          description: "Role-based access control and encrypted data storage"
        }
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="features-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8 sm:mb-12">
          <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
            Built for Speed and Simplicity
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
            Automate ceremonies, gain insights, and ship faster — all in one platform
          </p>
        </header>
        
        <div className="space-y-12">
          {featureCategories.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-xl font-semibold mb-6 text-center text-primary">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {category.features.map((feature, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div 
                        className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4"
                        aria-hidden="true"
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
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
