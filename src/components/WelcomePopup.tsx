import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, Clock, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

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
      <DialogContent className="sm:max-w-[600px] animate-in slide-in-from-bottom duration-500">
        <DialogHeader>
          <div className="flex items-center justify-between mb-3">
            <Badge className="gap-2" variant="secondary">
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI-Powered Agile Platform
            </Badge>
          </div>
          <DialogTitle className="text-3xl font-bold">
            Save 10+ Hours Per Sprint with AI
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-3">
            Automate sprint ceremonies, get instant insights, and focus on what matters - building great products.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-2xl text-primary">10+</p>
              <p className="text-xs text-muted-foreground">Hours saved per sprint</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-2xl text-primary">50%</p>
              <p className="text-xs text-muted-foreground">Less ceremony time</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-2xl text-primary">2 min</p>
              <p className="text-xs text-muted-foreground">Setup time</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">AI Sprint Planning in 30 Minutes</p>
                <p className="text-sm text-muted-foreground">What used to take 3 hours now takes 30 minutes</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Instant Retrospective Insights</p>
                <p className="text-sm text-muted-foreground">AI analyzes patterns and suggests improvements</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Real-Time Team Collaboration</p>
                <p className="text-sm text-muted-foreground">Everyone stays aligned without endless meetings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Link to="/auth" className="flex-1" onClick={handleClose}>
            <Button className="w-full gap-2 font-semibold">
              <Rocket className="w-4 h-4" />
              Start Free - Save Time Today
            </Button>
          </Link>
          <Button onClick={handleClose} variant="outline" className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" />
            Explore Demo First
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground pt-2">
          Free forever • No credit card • Setup in 2 minutes
        </p>
      </DialogContent>
    </Dialog>
  );
};
