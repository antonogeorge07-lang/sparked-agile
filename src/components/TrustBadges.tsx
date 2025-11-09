import { Shield, Lock, Zap, Award, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TrustBadges = () => {
  const badges = [
    // Add verified badges here when available
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {badges.length > 0 ? badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <Badge 
            key={index}
            variant="outline" 
            className="gap-2 px-4 py-2 text-sm font-medium border-2"
          >
            <Icon className={`h-4 w-4 ${badge.color}`} />
            {badge.text}
          </Badge>
        );
      }) : null}
    </div>
  );
};
