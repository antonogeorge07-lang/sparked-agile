import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OnboardingStep {
  title: string;
  description: string;
  tip: string;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to SAFe Agile Platform",
    description: "This quick tour will guide you through the key features of our AI-powered agile workflow platform.",
    tip: "You can skip this tour anytime and access it later from the Demo page."
  },
  {
    title: "Daily Standup",
    description: "Start your day by sharing team updates. Our AI analyzes the information and generates insightful summaries, helping identify blockers and track progress.",
    tip: "Navigate to Standup from the menu to begin your first daily sync."
  },
  {
    title: "Sprint Planning",
    description: "Plan your sprints effectively with AI-powered recommendations. Input your team capacity and backlog, and get optimized sprint plans based on velocity and priorities.",
    tip: "Access Planning to create data-driven sprint plans."
  },
  {
    title: "Workflows & AI Processing",
    description: "Use AI workflows to analyze standup data, extract sprint details, and generate retrospective insights. The platform automatically creates action items from your inputs.",
    tip: "Visit Workflows to see AI processing in action."
  },
  {
    title: "Dashboard & Metrics",
    description: "Monitor your team's performance with real-time metrics, velocity trends, and active impediments. Export reports to PowerPoint for stakeholder presentations.",
    tip: "Check the Dashboard for comprehensive sprint health insights."
  },
  {
    title: "Integrations",
    description: "Connect your JIRA and GitHub accounts to sync issues, commits, and pull requests. View integrated data across Flow Metrics, Program Increments, and Project Progress pages.",
    tip: "Set up integrations to unify your development workflow."
  },
  {
    title: "You're All Set!",
    description: "You now know the basics of the SAFe Agile Platform. Start by creating a project in Workflows or running your first Daily Standup.",
    tip: "Explore the Demo page anytime to see detailed feature walkthroughs."
  }
];

export const OnboardingTour = ({ isOpen, onClose }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isOpen && currentStep > 0) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      toast.success(`Step ${currentStep + 2} of ${onboardingSteps.length}`, {
        description: onboardingSteps[currentStep + 1].title,
        icon: <Sparkles className="w-4 h-4" />,
      });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    onClose();
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 pt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </p>
          </div>
        </DialogHeader>

        <div className="py-6">
          <DialogDescription className="text-base leading-relaxed mb-4">
            {step.description}
          </DialogDescription>
          
          <div className={`bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3 transition-all duration-500 ${
            showTooltip ? 'scale-105 shadow-elevated' : ''
          }`}>
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-primary mb-1">Pro Tip</p>
              <p className="text-sm text-muted-foreground">{step.tip}</p>
            </div>
          </div>

          {currentStep === 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> Take this tour at your own pace. You can skip or come back anytime!
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            <Button onClick={handleNext} className="gap-2">
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
