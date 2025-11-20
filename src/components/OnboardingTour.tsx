import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft, X, Sparkles, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    title: "Welcome to SAAI Platform",
    description: "Cut your sprint overhead by 50% with AI automation. This quick 3-step tour shows you the essentials.",
    tip: "Skip anytime and explore on your own."
  },
  {
    title: "Visual Project Management",
    description: "Drag-and-drop tasks, real-time collaboration, and AI-powered insights all in one place.",
    tip: "Visit Project Command Centre to see it in action."
  },
  {
    title: "You're All Set!",
    description: "Start exploring or sign up to save your work and unlock premium features.",
    tip: "Continue as guest or create an account."
  }
];

export const OnboardingTour = ({ isOpen, onClose }: OnboardingTourProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
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

  const handleContinueAsGuest = () => {
    localStorage.setItem("guest_mode", "true");
    localStorage.setItem("onboarding_completed", "true");
    onClose();
    navigate("/dashboard");
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
          
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
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
