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
  Eye
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
    title: "Welcome to SAAI! 🎉",
    description: "Streamline your sprint ceremonies with AI assistance. Let me show you the key features in 60 seconds.",
    icon: Sparkles,
    benefit: "Work more efficiently with AI-powered tools"
  },
  {
    id: "ai-assistant",
    title: "Meet Omair, Your AI Assistant",
    description: "Ask questions, get insights, and streamline your agile ceremonies. Available after you sign up to help with project management.",
    icon: MessageSquare,
    benefit: "Get AI-powered answers to project management questions"
  },
  {
    id: "command-centre",
    title: "Visual Project Management",
    description: "Drag-and-drop tasks across stages. Collaborate with your team. All your projects in one view.",
    icon: Target,
    action: {
      label: "See Command Centre",
      path: "/project-command-centre"
    },
    benefit: "Manage projects visually with drag-and-drop simplicity"
  },
  {
    id: "ceremonies",
    title: "Streamline Agile Ceremonies",
    description: "AI-assisted standups, sprint planning, retrospectives, and reviews. Work more efficiently.",
    icon: Calendar,
    action: {
      label: "Explore Sprint AI",
      path: "/sprint-planning-assistant"
    },
    benefit: "Reduce ceremony overhead significantly"
  },
  {
    id: "integrations",
    title: "Connect Your Tools",
    description: "Seamlessly integrate with JIRA, GitHub, and Microsoft 365. Sync your existing workflows.",
    icon: Zap,
    action: {
      label: "View Integrations",
      path: "/integrations"
    },
    benefit: "One platform for all your project data"
  },
  {
    id: "analytics",
    title: "Track Team Performance",
    description: "Metrics, velocity tracking, and actionable insights. Make data-driven decisions.",
    icon: BarChart3,
    action: {
      label: "See Analytics",
      path: "/usage-analytics"
    },
    benefit: "Monitor and improve team velocity"
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
    navigate("/dashboard");
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
    }, 2000);
  };

  const handleAction = (action?: OnboardingStep['action']) => {
    // If there's no actionable path, simply proceed to the next step
    if (!action || !action.path) {
      handleNext();
      return;
    }

    // Only when explicitly navigating do we close and mark in-progress
    localStorage.setItem("saai_onboarding_in_progress", "true");
    // Keep the walkthrough open by default; navigate after completion instead.
    // For now, just advance to next step to avoid interruptions
    handleNext();
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];
  const StepIcon = step.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <Card className="max-w-2xl w-full shadow-2xl border-2 animate-in slide-in-from-bottom-4 duration-500">
        {!completed ? (
          <>
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <StepIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
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
                
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    {step.benefit}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {currentStep === 0 && (
                    <Button
                      variant="outline"
                      onClick={handleSkipAndContinueAsGuest}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Skip & Continue as Guest
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                  >
                    Skip Tour
                  </Button>

                  {step.action ? (
                    <Button
                      onClick={() => handleAction(step.action)}
                      className="gap-2"
                    >
                      {step.action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="gap-2"
                    >
                      {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
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
                        ? 'w-8 bg-primary' 
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
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
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">You're All Set! 🎉</h3>
              <p className="text-muted-foreground">
                You're ready to supercharge your agile workflow with AI
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="gap-2"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};