import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DemoModeButton } from "@/components/DemoModeButton";
import { TrustBadges } from "@/components/TrustBadges";
import { lazy, Suspense } from "react";

const TrustBadgesLazy = lazy(() => import("@/components/TrustBadges").then(module => ({ default: module.TrustBadges })));

interface HeroSectionProps {
  onWatchDemo: () => void;
  onEarlyAccess: () => void;
}

export function HeroSection({ onWatchDemo, onEarlyAccess }: HeroSectionProps) {
  const { trackButtonClick } = useAnalytics();

  return (
    <>
      <section className="py-12 sm:py-20 px-4" aria-labelledby="hero-heading">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col items-center gap-3 mb-2">
              <Badge className="gap-2" variant="secondary">
                <Sparkles className="h-3 w-3 animate-pulse" aria-hidden="true" />
                AI-Powered Scrum Master Assistant
              </Badge>
            </div>
            <h1 id="hero-heading" className="text-3xl sm:text-5xl font-bold px-4 md:text-6xl">
              AI-Powered Agile.
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                From Planning to Retrospectives in Minutes
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:text-lg">
              SAAI automates your sprint ceremonies, backlog prioritization and team insights — so you deliver 40% faster, with less overhead.
              <span className="block mt-2 text-sm font-medium text-primary">
                ✓ Free today, premium features coming soon • ✓ No credit card • ✓ 2-minute setup
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => trackButtonClick('Start Free Today', 'hero')}
                  aria-label="Start free with SAAI today"
                >
                  Start Free Today
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <DemoModeButton />
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  trackButtonClick('Watch Demo', 'hero');
                  onWatchDemo();
                }}
                aria-label="Watch a video demonstration of SAAI features"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={onEarlyAccess}
                className="text-sm text-primary hover:underline"
                aria-label="Sign up for early access to beta features"
              >
                🎁 Get early access to beta features
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4" aria-label="Trust indicators">
        <div className="container mx-auto max-w-6xl">
          <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded" />}>
            <TrustBadgesLazy />
          </Suspense>
        </div>
      </section>
    </>
  );
}
