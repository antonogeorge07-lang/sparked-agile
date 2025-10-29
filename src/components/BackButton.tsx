import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleBack = () => {
    if (window.history.length > 2) {
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
