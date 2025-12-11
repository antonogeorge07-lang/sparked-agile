import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface ProofSectionProps {
  onWatchDemo: () => void;
}

export function ProofSection({ onWatchDemo }: ProofSectionProps) {
  return (
    <section className="py-16 px-4" aria-labelledby="proof-heading">
      <div className="container mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Proof points */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">Working Platform</Badge>
              <h2 id="proof-heading" className="text-2xl md:text-3xl font-bold mb-3">
                See It In Action
              </h2>
              <p className="text-muted-foreground">
                Not just promises—a working platform used by real teams.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">AI generates sprint plans from your backlog</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Real-time sync with JIRA and GitHub</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Automated standup summaries and insights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">Production-ready, enterprise security</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth">
                <Button className="gap-2 w-full sm:w-auto">
                  Try It Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" className="gap-2" onClick={onWatchDemo}>
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right: Visual demo card */}
          <Card className="p-1 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="bg-card rounded-lg p-6 space-y-4">
              {/* Mock sprint planning interface */}
              <div className="flex items-center justify-between">
                <div className="font-semibold">Sprint Planning AI</div>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">User Auth Flow</span>
                  <Badge variant="secondary">5 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Dashboard Redesign</span>
                  <Badge variant="secondary">8 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">API Integration</span>
                  <Badge variant="secondary">3 pts</Badge>
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary mb-1">
                  <Sparkles className="h-4 w-4" />
                  AI Recommendation
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on team velocity of 21 pts/sprint, recommend adding API Integration to this sprint.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
