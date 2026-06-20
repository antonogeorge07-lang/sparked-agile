import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressTracker = ({ steps, currentStep }: ProgressTrackerProps) => {
  const progress = (steps.filter(s => s.completed).length / steps.length) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Progress Summary */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Setup Progress</span>
        <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Fishbone Timeline Flow - Desktop */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Main horizontal line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-border" 
               style={{ width: `${((steps.length - 1) / steps.length) * 100}%`, left: `${(50 / steps.length)}%` }} />
          
          {/* Steps */}
          <div className="flex justify-between items-start gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                {/* Connector Line - Active Progress */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute top-8 left-1/2 h-0.5 transition-all duration-500",
                      step.completed ? "bg-primary w-full" : "bg-transparent w-0"
                    )}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
                
                {/* Node */}
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center z-10 transition-all duration-300 shadow-lg",
                  step.completed && "bg-primary text-primary-foreground scale-110 animate-pulse",
                  index === currentStep && !step.completed && "bg-primary/20 border-2 border-primary ring-4 ring-primary/20",
                  !step.completed && index !== currentStep && "bg-muted border-2 border-border"
                )}>
                  {step.completed ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Circle className={cn(
                      "w-6 h-6",
                      index === currentStep ? "text-primary fill-primary/20" : "text-muted-foreground"
                    )} />
                  )}
                </div>
                
                {/* Label */}
                <div className="mt-4 text-center w-full px-1">
                  <p className={cn(
                    "text-xs font-medium leading-tight transition-colors",
                    step.completed && "text-primary font-semibold",
                    index === currentStep && !step.completed && "text-primary font-semibold",
                    !step.completed && index !== currentStep && "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Vertical Flow */}
      <div className="lg:hidden space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300",
              step.completed && "bg-primary/10 border-primary/50 shadow-md",
              index === currentStep && !step.completed && "bg-primary/5 border-primary/30 ring-2 ring-primary/20",
              !step.completed && index !== currentStep && "bg-muted/30 border-border"
            )}>
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                step.completed && "bg-primary text-primary-foreground",
                index === currentStep && !step.completed && "bg-primary/20 border-2 border-primary",
                !step.completed && index !== currentStep && "bg-background border-2 border-border"
              )}>
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className={cn(
                    "w-5 h-5",
                    index === currentStep ? "text-primary fill-primary/20" : "text-muted-foreground"
                  )} />
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  step.completed && "text-primary",
                  index === currentStep && !step.completed && "text-primary"
                )}>
                  {step.title}
                </p>
              </div>

              {/* Arrow for active step */}
              {index === currentStep && !step.completed && (
                <ArrowRight className="w-5 h-5 text-primary animate-pulse" />
              )}
            </div>
            
            {/* Vertical connector */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-0.5 h-3 mx-auto transition-all duration-300",
                step.completed ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
