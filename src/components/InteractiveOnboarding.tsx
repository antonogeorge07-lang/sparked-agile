import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Target,
  Users,
  Zap,
  BarChart3,
  Calendar,
  MessageSquare,
  Eye,
  Mail,
  Github,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    path?: string;
    external?: boolean;
  };
  benefit: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Stay Informed, Effortlessly",
    description: "Get a daily email digest with everything you need to know about your team's progress. No more chasing updates.",
    icon: Mail,
    benefit: "Start your day informed in under 2 minutes"
  },
  {
    id: "github",
    title: "GitHub Activity at a Glance",
    description: "See commits, PRs, and issues from your repos. Know what shipped and what's in progress without digging through GitHub.",
    icon: Github,
    benefit: "Never miss important code changes"
  },
  {
    id: "insights",
    title: "AI-Powered Insights",
    description: "Get smart summaries and highlights. Our AI identifies blockers, progress patterns, and what needs your attention.",
    icon: TrendingUp,
    benefit: "Focus on what matters most"
  },
  {
    id: "free",
    title: "Free Forever",
    description: "Daily Digest is completely free. Connect your GitHub, invite your team, and start receiving insights today.",
    icon: Sparkles,
    action: {
      label: "Get Started Free",
      path: "/auth"
    },
    benefit: "No credit card required"
  }
];

export const InteractiveOnboarding = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    // Check if user has seen onboarding (now managed by visitor tracking)
    const hasSeenOnboarding = localStorage.getItem("saai_onboarding_completed");
    const isFirstVisit = !localStorage.getItem("saai_visited_before");
    
    if (!hasSeenOnboarding && isFirstVisit) {
      // Quick delay to show engagement immediately
      setTimeout(() => {
        setIsOpen(true);
      }, 500);
      localStorage.setItem("saai_visited_before", "true");
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("saai_onboarding_completed", "true");
    setIsOpen(false);
  };

  const handleSkipAndContinueAsGuest = () => {
    localStorage.setItem("saai_onboarding_completed", "true");
    localStorage.setItem("guest_mode", "true");
    setIsOpen(false);
  };

  const handleComplete = () => {
    setCompleted(true);
    localStorage.setItem("saai_onboarding_completed", "true");
    
    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setIsOpen(false);
      navigate("/auth");
    }, 2000);
  };

  const handleAction = (action?: OnboardingStep['action']) => {
    if (!action || !action.path) {
      handleNext();
      return;
    }

    localStorage.setItem("saai_onboarding_completed", "true");
    setIsOpen(false);
    navigate(action.path);
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <Card className="max-w-2xl w-full shadow-2xl border-2 animate-in slide-in-from-bottom-4 duration-500">
        {!completed ? (
          <>
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-tier-free/20 flex items-center justify-center">
                    <StepIcon className="h-6 w-6 text-tier-free" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1 bg-tier-free/10 text-tier-free border-tier-free/20">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Progress value={progress} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-lg text-muted-foreground">
                  {step.description}
                </p>
                
                <div className="flex items-center gap-2 p-3 bg-tier-free/10 border border-tier-free/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-tier-free flex-shrink-0" />
                  <p className="text-sm font-medium text-tier-free">
                    {step.benefit}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t">
                {/* Primary action row */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {step.action ? (
                      <Button
                        onClick={() => handleAction(step.action)}
                        className="gap-2 w-full sm:w-auto bg-tier-free hover:bg-tier-free/90"
                      >
                        {step.action.label}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="gap-2 w-full sm:w-auto bg-tier-free hover:bg-tier-free/90"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Secondary actions row */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {currentStep === 0 && (
                    <Button
                      variant="outline"
                      onClick={handleSkipAndContinueAsGuest}
                      className="gap-2 text-sm"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                      Continue as Guest
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    size="sm"
                    className="text-sm"
                  >
                    Skip Tour
                  </Button>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-tier-free' 
                        : index < currentStep
                        ? 'w-2 bg-tier-free/50'
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-tier-free/10 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-10 w-10 text-tier-free" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">You're All Set! 🎉</h3>
              <p className="text-muted-foreground">
                Sign up to start receiving your Daily Digest
              </p>
            </div>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gap-2 bg-tier-free hover:bg-tier-free/90"
            >
              <Mail className="h-4 w-4" />
              Get Your Daily Digest
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
