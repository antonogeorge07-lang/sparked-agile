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
      <section className="py-12 sm:py-20 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
            {/* Social proof badge */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <Badge className="gap-2 text-xs sm:text-sm px-3 py-1.5 animate-in slide-in-from-top duration-500" variant="secondary">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" aria-hidden="true" />
                Save 10+ Hours Per Sprint with AI Automation
              </Badge>
            </div>

            {/* Main headline - benefit-focused */}
            <h1 id="hero-heading" className="text-3xl sm:text-5xl font-bold px-4 md:text-6xl leading-tight animate-in slide-in-from-bottom duration-700">
              Cut Sprint Overhead by <span className="bg-gradient-primary bg-clip-text text-transparent">50%</span>
              <span className="block mt-2 text-2xl sm:text-4xl md:text-5xl">
                with AI-Powered Agile Management
              </span>
            </h1>

            {/* Value proposition with specific benefits */}
            <p className="text-base text-muted-foreground max-w-3xl mx-auto px-4 sm:text-lg leading-relaxed animate-in fade-in duration-1000">
              Automate sprint ceremonies, generate insights instantly, and track team performance—all in one platform. 
              <span className="block mt-3 text-foreground font-semibold">
                Go from 3-hour planning sessions to 30 minutes.
              </span>
            </p>

            {/* Quick wins list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto px-4 py-4 animate-in fade-in duration-1000 delay-300">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground">Free • No credit card</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground">Setup in 2 minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>
                </div>
                <span className="text-muted-foreground">Instant AI insights</span>
              </div>
            </div>

            {/* CTA buttons with stronger messaging */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 px-4 animate-in slide-in-from-bottom duration-1000 delay-500">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
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
                aria-label="Watch a demonstration of SAAI features"
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Secondary CTA */}
            <div className="mt-4 text-center animate-in fade-in duration-1000 delay-700">
              <button
                onClick={onEarlyAccess}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                aria-label="Sign up for early access to premium features"
              >
                <Sparkles className="h-3 w-3" />
                Get early access to premium features
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
