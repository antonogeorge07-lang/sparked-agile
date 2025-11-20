import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Sparkles, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

interface GuestModeBarProps {
  onTryDemo?: () => void;
}

export const GuestModeBar = ({ onTryDemo }: GuestModeBarProps) => {
  const navigate = useNavigate();
  const { visitorData, shouldShowSignupReminder, updatePreferences } = useVisitorTracking();

  // Don't show if dismissed or not needed
  if (!shouldShowSignupReminder) return null;

  const handleDismiss = () => {
    updatePreferences({ has_dismissed_signup_reminder: true });
  };

  // Show condensed version after 3+ visits
  const isCondensed = visitorData && visitorData.visit_count >= 3;

  return (
    <Card className={`fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary/20 bg-card/95 backdrop-blur-sm shadow-elevated transition-all duration-300 ${
      isCondensed ? 'py-2' : 'py-3'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {!isCondensed && (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1">
              {isCondensed ? (
                <p className="text-xs text-muted-foreground">
                  Guest Mode • <button onClick={() => navigate("/auth")} className="text-primary hover:underline">Sign up</button> to save your work
                </p>
              ) : (
                <>
                  <p className="font-semibold text-sm">You're in Guest Mode</p>
                  <p className="text-xs text-muted-foreground">Sign up to save your work and unlock all features</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {!isCondensed && (
              <>
                <Button 
                  onClick={() => navigate("/auth")} 
                  size="sm" 
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up Free
                </Button>
                {onTryDemo && (
                  <Button 
                    onClick={onTryDemo}
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Try Demo
                  </Button>
                )}
              </>
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