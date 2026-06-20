import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Sparkles, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuestModeBarProps {
  onTryDemo?: () => void;
}

const STORAGE_KEY = "guest_mode_dismissed";

export const GuestModeBar = ({ onTryDemo }: GuestModeBarProps) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-[45] border-t-2 border-primary/20 bg-card/95 backdrop-blur-sm shadow-elevated transition-all duration-300 py-3 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">You're in Guest Mode</p>
              <p className="text-xs text-muted-foreground">Sign up to save your work and unlock all features</p>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap justify-center sm:justify-end">
            <Button 
              onClick={() => navigate("/auth")} 
              size="sm" 
              className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sign Up Free</span>
              <span className="xs:hidden">Sign Up</span>
            </Button>
            {onTryDemo && (
              <Button 
                onClick={onTryDemo}
                variant="outline" 
                size="sm" 
                className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Try Demo</span>
                <span className="xs:hidden">Demo</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
