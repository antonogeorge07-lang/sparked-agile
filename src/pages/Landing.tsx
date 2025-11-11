import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { DemoModal } from "@/components/DemoModal";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { HeroSection } from "@/components/landing/HeroSection";
import { OptimizedImage } from "@/components/OptimizedImage";
import { InteractiveOnboarding } from "@/components/InteractiveOnboarding";
import { FAQSchema } from "@/components/landing/FAQSchema";
import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import saaiLogo from "@/assets/saai-logo.png";

// Lazy load sections below the fold for better initial page load
const SocialProofSection = lazy(() => import("@/components/landing/SocialProofSection").then(module => ({ default: module.SocialProofSection })));
const QuickValueSection = lazy(() => import("@/components/landing/QuickValueSection").then(module => ({ default: module.QuickValueSection })));
const ValuePropositionSection = lazy(() => import("@/components/landing/ValuePropositionSection").then(module => ({ default: module.ValuePropositionSection })));
const AIAssistantShowcase = lazy(() => import("@/components/landing/AIAssistantShowcase").then(module => ({ default: module.AIAssistantShowcase })));
const ProjectCommandCentreSection = lazy(() => import("@/components/landing/ProjectCommandCentreSection").then(module => ({ default: module.ProjectCommandCentreSection })));
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection").then(module => ({ default: module.FeaturesSection })));
const FeedbackSection = lazy(() => import("@/components/landing/FeedbackSection").then(module => ({ default: module.FeedbackSection })));
const CTASection = lazy(() => import("@/components/landing/CTASection").then(module => ({ default: module.CTASection })));
const FooterSection = lazy(() => import("@/components/landing/FooterSection").then(module => ({ default: module.FooterSection })));

const PricingSection = lazy(() => import("@/components/landing/PricingSection").then(module => ({ default: module.PricingSection })));

const SectionSkeleton = () => (
  <div className="py-20 px-4">
    <div className="container mx-auto max-w-6xl">
      <div className="h-64 animate-pulse bg-muted rounded" />
    </div>
  </div>
);

export default function Landing() {
  const { trackButtonClick } = useAnalytics();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailContext, setEmailContext] = useState<"early_access" | "newsletter" | "beta" | "exit_intent">("newsletter");
  const navigate = useNavigate();

  // Exit intent detection
  useEffect(() => {
    let exitIntentShown = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        setEmailContext("exit_intent");
        setShowEmailCapture(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  useEffect(() => {
    // Redirect authenticated users
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const hasCompletedWorkspace = localStorage.getItem("workspace_setup_completed");
        navigate(hasCompletedWorkspace ? "/dashboard" : "/project-workspace");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleWatchDemo = () => setIsDemoOpen(true);
  
  const handleEarlyAccess = () => {
    setEmailContext("early_access");
    setShowEmailCapture(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO: FAQ Structured Data */}
      <FAQSchema />
      
      {/* Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center" aria-label="SAAI home">
              <OptimizedImage 
                src={saaiLogo} 
                alt="SAAI - Agile Active Intelligence logo" 
                className="h-10 w-auto object-contain"
                priority={true}
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/about" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => trackButtonClick('About', 'nav')}
                  aria-label="Learn about SAAI"
                >
                  About
                </Button>
              </Link>
              <Link to="/subscription" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => trackButtonClick('Pricing', 'nav')}
                  aria-label="View pricing plans"
                >
                  Pricing
                </Button>
              </Link>
              <Link to="/blog" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => trackButtonClick('Blog', 'nav')}
                  aria-label="Read our blog"
                >
                  Blog
                </Button>
              </Link>
              <Link to="/auth" className="hidden sm:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => trackButtonClick('Sign In', 'nav')}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="sm" 
                  onClick={() => trackButtonClick('Get Started', 'nav')}
                  aria-label="Get started with SAAI"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection 
          onWatchDemo={handleWatchDemo}
          onEarlyAccess={handleEarlyAccess}
        />
        
        <Suspense fallback={<SectionSkeleton />}>
          <SocialProofSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <QuickValueSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <ValuePropositionSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <AIAssistantShowcase />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <ProjectCommandCentreSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturesSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <PricingSection onEarlyAccess={handleEarlyAccess} />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <FeedbackSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <CTASection />
        </Suspense>
      </main>

      <Suspense fallback={<div className="border-t border-border py-12 px-4 h-64 animate-pulse bg-muted" />}>
        <FooterSection />
      </Suspense>

      {/* Modals */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <EmailCaptureForm 
        isOpen={showEmailCapture} 
        onClose={() => setShowEmailCapture(false)} 
        context={emailContext} 
      />
      
      {/* Interactive Onboarding for First-Time Visitors */}
      <InteractiveOnboarding />
    </div>
  );
}
