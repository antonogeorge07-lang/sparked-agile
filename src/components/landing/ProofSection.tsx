import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, CheckCircle2, Mail, GitBranch, Clock } from "lucide-react";
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
              <Badge variant="outline" className="mb-3 border-tier-free/30 text-tier-free">How It Works</Badge>
              <h2 id="proof-heading" className="text-2xl md:text-3xl font-bold mb-3">
                From Setup to Inbox in 2 Minutes
              </h2>
              <p className="text-muted-foreground">
                Connect your GitHub or JIRA, and start receiving daily digests. No complex configuration required.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tier-free/10 flex items-center justify-center text-sm font-medium text-tier-free">1</div>
                <span className="text-sm">Connect your GitHub repository or JIRA board</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tier-free/10 flex items-center justify-center text-sm font-medium text-tier-free">2</div>
                <span className="text-sm">Choose your digest frequency and preferences</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-tier-free/10 flex items-center justify-center text-sm font-medium text-tier-free">3</div>
                <span className="text-sm">Receive daily emails with your team's progress</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-tier-free flex-shrink-0" />
                <span className="text-sm font-medium">That's it. No daily logins needed.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth">
                <Button className="gap-2 w-full sm:w-auto bg-tier-free hover:bg-tier-free/90">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" className="gap-2" onClick={onWatchDemo}>
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right: Visual demo card - Email Preview */}
          <Card className="p-1 bg-gradient-to-br from-tier-free/5 to-primary/5 border-tier-free/20">
            <div className="bg-card rounded-lg p-6 space-y-4">
              {/* Mock email header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Daily Digest - Dec 23</div>
                    <div className="text-xs text-muted-foreground">from SAAI Digest</div>
                  </div>
                </div>
                <Badge className="bg-tier-free/10 text-tier-free border-tier-free/20 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  9:00 AM
                </Badge>
              </div>
              
              {/* Mock email content */}
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="h-4 w-4 text-tier-free" />
                    <span className="text-sm font-medium">12 commits merged</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Auth flow, dashboard redesign, API fixes</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-tier-free" />
                    <span className="text-sm font-medium">5 tickets closed</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Sprint velocity: 21 points (+15%)</p>
                </div>
                <div className="p-3 bg-tier-free/5 rounded-lg border border-tier-free/20">
                  <div className="text-xs text-tier-free font-medium mb-1">AI Summary</div>
                  <p className="text-xs text-muted-foreground">
                    Team on track for sprint goal. API integration ahead of schedule.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
