import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
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
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Setup Progress</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              step.completed && "bg-success/10 border-success/30",
              index === currentStep && !step.completed && "bg-primary/5 border-primary/30",
              !step.completed && index !== currentStep && "bg-muted/30"
            )}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
            ) : (
              <Circle className={cn(
                "h-5 w-5 flex-shrink-0",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            <div className="flex-1">
              <p className={cn(
                "font-medium text-sm",
                step.completed && "text-success",
                index === currentStep && !step.completed && "text-primary"
              )}>
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
