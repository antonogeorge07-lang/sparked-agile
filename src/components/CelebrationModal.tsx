import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, CheckCircle2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  nextAction?: {
    label: string;
    onClick: () => void;
  };
}

export const CelebrationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  nextAction 
}: CelebrationModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] text-center">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center animate-bounce">
              <PartyPopper className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            {nextAction && (
              <Button 
                onClick={() => {
                  nextAction.onClick();
                  onClose();
                }}
                size="lg"
                className="gap-2 flex-1"
              >
                {nextAction.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button 
              onClick={onClose}
              variant={nextAction ? "outline" : "default"}
              size="lg"
              className="flex-1"
            >
              {nextAction ? "I'll Explore First" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
