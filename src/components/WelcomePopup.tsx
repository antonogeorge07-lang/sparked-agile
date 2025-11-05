import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket } from "lucide-react";

export const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("welcome_popup_seen");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("welcome_popup_seen", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl">Welcome to SAFe Agile Platform!</DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            Transform your agile workflow with AI-powered automation. We help teams run better standups, 
            plan smarter sprints, and track progress effortlessly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Get Started in Seconds</p>
              <p className="text-sm text-muted-foreground">Try our demo mode or explore as a guest - no signup required!</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleClose} className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" />
            Let's Go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
