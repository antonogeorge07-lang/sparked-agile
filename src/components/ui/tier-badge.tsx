import { Badge } from "@/components/ui/badge";
import { Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: "free" | "pro";
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
        "bg-tier-pro/10 text-tier-pro border-tier-pro/20 hover:bg-tier-pro/20",
        className
      )}
    >
      {showIcon && <Crown className="h-3 w-3 mr-1" />}
      Pro
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
