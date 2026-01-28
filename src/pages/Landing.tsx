import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { DemoModal } from "@/components/DemoModal";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { HeroSectionSimple } from "@/components/landing/HeroSectionSimple";
import { ProofSection } from "@/components/landing/ProofSection";
import { CapabilityShowcase } from "@/components/landing/CapabilityShowcase";
import { SimpleCTA } from "@/components/landing/SimpleCTA";
import { PricingSection } from "@/components/landing/PricingSection";
import { OurPhilosophySection } from "@/components/landing/OurPhilosophySection";
import { OptimizedImage } from "@/components/OptimizedImage";
import { InteractiveOnboarding } from "@/components/InteractiveOnboarding";
import { FAQSchema } from "@/components/landing/FAQSchema";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import saaiLogo from "@/assets/saai-logo.png";
import { PrivacyBanner } from "@/components/PrivacyBanner";
import { Mail, LayoutDashboard, LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

// Lazy load heavier sections
const FeedbackSection = lazy(() => import("@/components/landing/FeedbackSection").then(module => ({ default: module.FeedbackSection })));

// Lazy load heavier sections
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailContext, setEmailContext] = useState<"early_access" | "newsletter" | "beta" | "exit_intent">("newsletter");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
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

  // No automatic redirect for authenticated users - they can navigate manually

  const handleWatchDemo = () => setIsDemoOpen(true);
  const handleEarlyAccess = () => {
    setEmailContext("early_access");
    setShowEmailCapture(true);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    }
  };

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
              <Link to="/features">
                <Button variant="ghost" size="sm">
                  {t('landing.features.title', 'Features')}
                </Button>
              </Link>
              <LanguageSwitcher />
              {user ? (
                <>
                  <Link to="/home">
                    <Button size="sm" className="gap-1.5" onClick={() => trackButtonClick('Go to Dashboard', 'nav')}>
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="hidden sm:block">
                    <Button variant="ghost" size="sm" onClick={() => trackButtonClick('Sign In', 'nav')}>
                      {t('landing.signIn')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="gap-1.5 bg-tier-free hover:bg-tier-free/90" onClick={() => trackButtonClick('Get Started', 'nav')}>
                      <Mail className="h-3.5 w-3.5" />
                      {t('landing.getDigest')}
                    </Button>
                  </Link>
                </>
              )}
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
          <OurPhilosophySection />
        </ScrollReveal>
        
        <ScrollReveal fullWidth delay={0.1}>
          <Suspense fallback={<SectionSkeleton />}>
            <FeedbackSection />
          </Suspense>
        </ScrollReveal>

        <ScrollReveal fullWidth delay={0.1}>
          <PricingSection onEarlyAccess={handleEarlyAccess} />
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
