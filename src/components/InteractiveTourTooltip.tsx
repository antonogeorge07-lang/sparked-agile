import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface TooltipStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface InteractiveTourTooltipProps {
  steps: TooltipStep[];
  onComplete: () => void;
  isActive: boolean;
}

export const InteractiveTourTooltip = ({ steps, onComplete, isActive }: InteractiveTourTooltipProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updatePosition = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const position = steps[currentStep].position || "bottom";
        
        let top = 0;
        let left = 0;

        switch (position) {
          case "bottom":
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case "top":
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case "right":
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
          case "left":
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
        }

        setTooltipPosition({ top, left });
        
        // Highlight the element
        element.classList.add("ring-2", "ring-primary", "ring-offset-2");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, steps, isActive]);

  if (!isActive || !steps[currentStep]) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      className="fixed z-50 animate-fade-in"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <Card className="max-w-sm shadow-elevated border-2 border-primary/20 bg-card">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">{steps[currentStep].title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button size="sm" onClick={handleNext} className="gap-2">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-3 w-3" />
                </>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};