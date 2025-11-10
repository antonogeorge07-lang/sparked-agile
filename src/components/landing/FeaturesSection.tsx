import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, GitBranch, BarChart } from "lucide-react";

export function FeaturesSection() {
  const featureCategories = [
    {
      category: "Planning",
      features: [
        {
          icon: Sparkles,
          title: "AI Sprint Planning",
          description: "Turn 10-hour planning sessions into 2 hours"
        },
        {
          icon: BarChart,
          title: "Smart Backlog Health",
          description: "AI spots stale items and suggests priorities"
        }
      ]
    },
    {
      category: "Execution & Visibility",
      features: [
        {
          icon: GitBranch,
          title: "JIRA & GitHub Sync",
          description: "Connect in 2 minutes, sync automatically"
        }
      ]
    },
    {
      category: "Insights & Retrospectives",
      features: [
        {
          icon: Zap,
          title: "Automated Retros",
          description: "Anonymous feedback to AI-powered insights"
        }
      ]
    }
  ];

  return (
    <section className="py-20 px-4" aria-labelledby="features-heading">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need. Nothing You Don't.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Four core capabilities that transform how teams work
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
