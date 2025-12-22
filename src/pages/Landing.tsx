import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { DemoModal } from "@/components/DemoModal";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { HeroSectionSimple } from "@/components/landing/HeroSectionSimple";
import { ProofSection } from "@/components/landing/ProofSection";
import { CapabilityShowcase } from "@/components/landing/CapabilityShowcase";
import { SimpleCTA } from "@/components/landing/SimpleCTA";
import { OptimizedImage } from "@/components/OptimizedImage";
import { InteractiveOnboarding } from "@/components/InteractiveOnboarding";
import { FAQSchema } from "@/components/landing/FAQSchema";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import saaiLogo from "@/assets/saai-logo.png";
import { PrivacyBanner } from "@/components/PrivacyBanner";

// Lazy load heavier sections
const FeedbackSection = lazy(() => import("@/components/landing/FeedbackSection").then(module => ({ default: module.FeedbackSection })));
const FooterSection = lazy(() => import("@/components/landing/FooterSection").then(module => ({ default: module.FooterSection })));

const SectionSkeleton = () => (
  <div className="py-16 px-4 min-h-[200px]">
    <div className="container mx-auto max-w-5xl">
      <div className="h-32 animate-pulse bg-muted rounded" />
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
    const checkAuthAndPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check user's preferred landing page
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', session.user.id)
          .single();
        
        const preferences = profile?.preferences as { landingPage?: string } | null;
        const preferredPage = preferences?.landingPage;
        
        if (preferredPage) {
          navigate(preferredPage);
        } else {
          // Fallback to workspace check for users without preference set
          const hasCompletedWorkspace = localStorage.getItem("workspace_setup_completed");
          navigate(hasCompletedWorkspace ? "/dashboard" : "/project-workspace");
        }
      }
    };
    checkAuthAndPreferences();
  }, [navigate]);

  const handleWatchDemo = () => setIsDemoOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <FAQSchema />
      
      {/* Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-2 rounded-xl border border-primary/10">
                <OptimizedImage 
                  src={saaiLogo} 
                  alt="SAAI" 
                  className="h-7 w-7 object-contain"
                  priority={true}
                />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SAAI
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" size="sm" onClick={() => trackButtonClick('Sign In', 'nav')}>
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" onClick={() => trackButtonClick('Get Started', 'nav')}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content - Streamlined */}
      <main>
        <HeroSectionSimple />
        
        <ScrollReveal fullWidth>
          <CapabilityShowcase />
        </ScrollReveal>
        
        <ScrollReveal fullWidth delay={0.1}>
          <ProofSection onWatchDemo={handleWatchDemo} />
        </ScrollReveal>
        
        <ScrollReveal fullWidth delay={0.1}>
          <Suspense fallback={<SectionSkeleton />}>
            <FeedbackSection />
          </Suspense>
        </ScrollReveal>
        
        <ScrollReveal fullWidth delay={0.1}>
          <SimpleCTA />
        </ScrollReveal>
      </main>

      <Suspense fallback={<div className="border-t border-border py-8 h-40 animate-pulse bg-muted" />}>
        <FooterSection />
      </Suspense>

      {/* Modals */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <EmailCaptureForm 
        isOpen={showEmailCapture} 
        onClose={() => setShowEmailCapture(false)} 
        context={emailContext} 
      />
      
      <InteractiveOnboarding />
      <PrivacyBanner />
    </div>
  );
}
