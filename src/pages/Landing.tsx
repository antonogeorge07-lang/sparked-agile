import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { DemoModal } from "@/components/DemoModal";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { HeroSection } from "@/components/landing/HeroSection";
import { ValuePropositionSection } from "@/components/landing/ValuePropositionSection";
import { ProjectCommandCentreSection } from "@/components/landing/ProjectCommandCentreSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FeedbackSection } from "@/components/landing/FeedbackSection";
import { CTASection } from "@/components/landing/CTASection";
import { FooterSection } from "@/components/landing/FooterSection";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import saaiLogo from "@/assets/saai-logo.png";

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
      {/* Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center" aria-label="SAAI home">
              <img 
                src={saaiLogo} 
                alt="SAAI - Agile Active Intelligence logo" 
                className="h-12 w-auto object-contain" 
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
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
        
        <ValuePropositionSection />
        
        <ProjectCommandCentreSection />
        
        <FeaturesSection />
        
        <FeedbackSection />
        
        <CTASection />
      </main>

      <FooterSection />

      {/* Modals */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <EmailCaptureForm 
        isOpen={showEmailCapture} 
        onClose={() => setShowEmailCapture(false)} 
        context={emailContext} 
      />
    </div>
  );
}
