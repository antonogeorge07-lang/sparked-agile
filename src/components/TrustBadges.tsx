import { Shield, Lock, Zap, Award, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TrustBadges = () => {
  const badges = [
    { icon: Shield, text: "Enterprise Security", color: "text-blue-600" },
    { icon: Lock, text: "SOC 2 Compliant", color: "text-green-600" },
    { icon: Zap, text: "99.9% Uptime", color: "text-yellow-600" },
    { icon: Award, text: "ISO 27001", color: "text-purple-600" },
    { icon: CheckCircle2, text: "GDPR Ready", color: "text-indigo-600" }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {badges.map((badge, index) => {
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
      })}
    </div>
  );
};
