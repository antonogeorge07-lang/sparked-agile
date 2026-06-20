import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

export const BackButton = ({ 
  label = "Back", 
  fallbackPath = "/dashboard",
  variant = "ghost",
  className = ""
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Use fallback if this is the first page in the session (no prior app navigation)
    // window.history.state?.idx tracks React Router's internal navigation index
    const routerIdx = window.history.state?.idx;
    if (typeof routerIdx === "number" && routerIdx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleBack}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};
