import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Sparkles, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";

export function HeroSectionSimple() {
  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-tier-free/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-tier-free/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-6">
          <Badge className="gap-2 bg-tier-free/10 text-tier-free border-tier-free/20" variant="outline">
            <Mail className="h-3 w-3" />
            Free Daily Digest
          </Badge>

          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span className="block">
              Stay Informed
            </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Effortlessly
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a daily email digest of your team's GitHub activity, sprint progress, and key updates. 
            No login required—just connect and receive.
          </p>

          {/* Value props */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-tier-free" />
              <span>2 min setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-tier-free" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-tier-free" />
              <span>Free forever</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 w-full sm:w-auto bg-tier-free hover:bg-tier-free/90">
                <Mail className="h-4 w-4" />
                Get Your Daily Digest
              </Button>
            </Link>
            <DemoModeButton />
          </div>

          {/* Pro teaser */}
          <div className="pt-6 border-t border-border/50 mt-8">
            <p className="text-sm text-muted-foreground">
              Need more? <Link to="/auth" className="text-primary hover:underline font-medium">Upgrade to Pro</Link> for sprint ceremonies, epic management, and team collaboration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
