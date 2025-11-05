import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Sparkles, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuestModeBarProps {
  onTryDemo?: () => void;
}

export const GuestModeBar = ({ onTryDemo }: GuestModeBarProps) => {
  const navigate = useNavigate();

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary/20 bg-card/95 backdrop-blur-sm shadow-elevated">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">You're in Guest Mode</p>
              <p className="text-xs text-muted-foreground">Sign up to save your work and unlock all features</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => navigate("/auth")} 
              size="sm" 
              className="gap-2 flex-1 sm:flex-none"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up Free
            </Button>
            {onTryDemo && (
              <Button 
                onClick={onTryDemo}
                variant="outline" 
                size="sm" 
                className="gap-2 flex-1 sm:flex-none"
              >
                <Sparkles className="w-4 h-4" />
                Try Demo
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};