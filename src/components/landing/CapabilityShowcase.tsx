import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GitBranch, BarChart3, Zap } from "lucide-react";

const capabilities = [
  {
    icon: Sparkles,
    title: "AI Sprint Planning",
    description: "Automated sprint recommendations from your backlog",
    badge: "Live"
  },
  {
    icon: GitBranch,
    title: "Epic & Project Tracking",
    description: "Visual dependency mapping and progress tracking",
    badge: "Live"
  },
  {
    icon: BarChart3,
    title: "Team Analytics",
    description: "Real-time velocity and performance insights",
    badge: "Live"
  },
  {
    icon: Zap,
    title: "JIRA & GitHub Sync",
    description: "Two-way sync with your existing tools",
    badge: "Live"
  }
];

export function CapabilityShowcase() {
  return (
    <section className="py-16 px-4 bg-muted/30" aria-labelledby="capabilities-heading">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-10">
          <h2 id="capabilities-heading" className="text-2xl md:text-3xl font-bold mb-3">
            What SAAI Does
          </h2>
          <p className="text-muted-foreground">
            Production-ready features your team can use today
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap, index) => (
            <Card 
              key={index} 
              className="p-5 hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <cap.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                  {cap.badge}
                </Badge>
              </div>
              <h3 className="font-semibold mb-1">{cap.title}</h3>
              <p className="text-sm text-muted-foreground">{cap.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
