import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Mail, GitBranch, BarChart3, Zap, Users, Target, Calendar, MessageSquare } from "lucide-react";

const freeCapabilities = [
  {
    icon: Mail,
    title: "Daily Digest Emails",
    description: "Automated daily summaries of team activity",
  },
  {
    icon: GitBranch,
    title: "GitHub Activity",
    description: "Commits, PRs, and issue updates at a glance",
  },
  {
    icon: BarChart3,
    title: "Sprint Highlights",
    description: "Key metrics and progress updates",
  },
  {
    icon: Zap,
    title: "Basic AI Insights",
    description: "Smart summaries and recommendations",
  },
];

const proCapabilities = [
  {
    icon: Calendar,
    title: "Sprint Ceremonies",
    description: "Automated planning, reviews & retros",
  },
  {
    icon: Target,
    title: "Epic Management",
    description: "Track large initiatives with dependencies",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Standups, blockers, and action items",
  },
  {
    icon: MessageSquare,
    title: "AI Sprint Planning",
    description: "Backlog analysis and sprint recommendations",
  },
];

export function CapabilityShowcase() {
  return (
    <section className="py-16 px-4 bg-muted/30" aria-labelledby="capabilities-heading">
      <div className="container mx-auto max-w-6xl">
        {/* Free Tier */}
        <div className="mb-12">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TierBadge tier="free" />
              <span className="text-sm text-muted-foreground">Included for everyone</span>
            </div>
            <h2 id="capabilities-heading" className="text-2xl md:text-3xl font-bold mb-3">
              Your Daily Digest
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get a daily email with everything you need to stay informed about your team's progress.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {freeCapabilities.map((cap, index) => (
              <Card 
                key={index} 
                className="p-5 hover:border-tier-free/50 transition-all hover:shadow-lg group border-tier-free/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-tier-free/10 flex items-center justify-center group-hover:bg-tier-free/20 transition-colors">
                    <cap.icon className="h-5 w-5 text-tier-free" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Pro Tier */}
        <div>
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TierBadge tier="pro" />
              <Badge variant="secondary" className="text-xs">Beta: Free</Badge>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Full Agile Platform
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upgrade when you're ready for AI-powered sprint ceremonies, epic tracking, and team collaboration.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proCapabilities.map((cap, index) => (
              <Card 
                key={index} 
                className="p-5 hover:border-tier-pro/50 transition-all hover:shadow-lg group border-tier-pro/20 bg-card/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-tier-pro/10 flex items-center justify-center group-hover:bg-tier-pro/20 transition-colors">
                    <cap.icon className="h-5 w-5 text-tier-pro" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
