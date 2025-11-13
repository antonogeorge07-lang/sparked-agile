import { useState, useEffect } from "react";
import { InteractiveTourTooltip } from "./InteractiveTourTooltip";
import { sidebarTourSteps } from "@/data/tourSteps";

interface SidebarTourProps {
  isActive: boolean;
  onComplete: () => void;
}

export const SidebarTour = ({ isActive, onComplete }: SidebarTourProps) => {
  const [shouldStart, setShouldStart] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Small delay to ensure sidebar is rendered
      const timer = setTimeout(() => setShouldStart(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShouldStart(false);
    }
  }, [isActive]);

  return (
    <InteractiveTourTooltip
      steps={sidebarTourSteps}
      onComplete={onComplete}
      isActive={shouldStart}
    />
  );
};
