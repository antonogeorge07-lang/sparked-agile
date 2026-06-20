import { Badge } from "@/components/ui/badge";
import { Clock, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: "free" | "coming-soon";
  className?: string;
  showIcon?: boolean;
}

export function TierBadge({ tier, className, showIcon = true }: TierBadgeProps) {
  if (tier === "free") {
    return (
      <Badge 
        className={cn(
          "bg-tier-free/10 text-tier-free border-tier-free/20 hover:bg-tier-free/20",
          className
        )}
      >
        {showIcon && <Zap className="h-3 w-3 mr-1" />}
        Free
      </Badge>
    );
  }

  return (
    <Badge 
      className={cn(
        "bg-muted text-muted-foreground border-border hover:bg-muted/80",
        className
      )}
    >
      {showIcon && <Clock className="h-3 w-3 mr-1" />}
      Coming Soon
    </Badge>
  );
}

interface UpgradeBadgeProps {
  className?: string;
}

export function UpgradeBadge({ className }: UpgradeBadgeProps) {
  return (
    <Badge 
      className={cn(
        "bg-gradient-pro text-tier-pro-foreground border-0 hover:opacity-90",
        className
      )}
    >
      <Crown className="h-3 w-3 mr-1" />
      Upgrade to Pro
    </Badge>
  );
}
