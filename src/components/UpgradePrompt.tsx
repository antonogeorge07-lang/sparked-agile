import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { TierBadge } from "@/components/ui/tier-badge";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  className?: string;
}

export function UpgradePrompt({ feature, description, className }: UpgradePromptProps) {
  return (
    <Card className={`border-muted bg-gradient-to-br from-muted/20 to-transparent ${className}`}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">{feature}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          Coming in 30 days
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureGateProps {
  tier: "free" | "coming-soon";
  feature: string;
  children: React.ReactNode;
  currentTier?: "free" | "coming-soon";
}

export function FeatureGate({ tier, feature, children, currentTier = "free" }: FeatureGateProps) {
  // If user has required tier or feature is free, show the feature
  if (tier === "free") {
    return <>{children}</>;
  }

  // Otherwise show coming soon overlay
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className="text-center p-4">
          <TierBadge tier="coming-soon" className="mb-2" />
          <p className="text-sm font-medium mb-2">{feature}</p>
          <p className="text-xs text-muted-foreground">Coming in 30 days</p>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
}

interface ComingSoonBadgeProps {
  className?: string;
}

export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <Clock className="h-3 w-3" />
      <span>Coming Soon</span>
    </div>
  );
}

interface UpgradeBannerProps {
  className?: string;
}

export function UpgradeBanner({ className }: UpgradeBannerProps) {
  return (
    <div className={`bg-muted text-foreground p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">More features coming soon</p>
            <p className="text-sm text-muted-foreground">Sprint ceremonies, epic management, and team collaboration - launching in 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
