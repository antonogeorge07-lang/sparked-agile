import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";

export function HeroSectionSimple() {
  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-6">
          <Badge className="gap-2" variant="secondary">
            <Sparkles className="h-3 w-3" />
            AI-Powered Agile Platform
          </Badge>

          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Ship Faster
            </span>
            <span className="block mt-2">
              With AI Sprint Planning
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SAAI automates sprint planning, standup summaries, and retrospective insights. 
            Connect your JIRA or GitHub and let AI handle the ceremony prep.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <DemoModeButton />
          </div>

          <p className="text-sm text-muted-foreground">
            Free forever • No credit card • 2 min setup
          </p>
        </div>
      </div>
    </section>
  );
}
