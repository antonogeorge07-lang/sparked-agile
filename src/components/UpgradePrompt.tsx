import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { TierBadge } from "@/components/ui/tier-badge";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  className?: string;
}

export function UpgradePrompt({ feature, description, className }: UpgradePromptProps) {
  return (
    <Card className={`border-tier-pro/30 bg-gradient-to-br from-tier-pro/5 to-transparent ${className}`}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tier-pro/10 flex items-center justify-center shrink-0">
            <Crown className="h-5 w-5 text-tier-pro" />
          </div>
          <div>
            <p className="font-medium text-sm">{feature}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Link to="/auth">
          <Button size="sm" className="bg-tier-pro hover:bg-tier-pro/90 gap-1">
            Upgrade
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

interface FeatureGateProps {
  tier: "free" | "pro";
  feature: string;
  children: React.ReactNode;
  currentTier?: "free" | "pro";
}

export function FeatureGate({ tier, feature, children, currentTier = "free" }: FeatureGateProps) {
  // If user has required tier or higher, show the feature
  if (tier === "free" || currentTier === "pro") {
    return <>{children}</>;
  }

  // Otherwise show upgrade prompt
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className="text-center p-4">
          <TierBadge tier="pro" className="mb-2" />
          <p className="text-sm font-medium mb-2">{feature}</p>
          <Link to="/auth">
            <Button size="sm" className="bg-tier-pro hover:bg-tier-pro/90">
              Unlock with Pro
            </Button>
          </Link>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
}

interface ProFeatureBadgeProps {
  className?: string;
}

export function ProFeatureBadge({ className }: ProFeatureBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1 text-xs text-tier-pro ${className}`}>
      <Crown className="h-3 w-3" />
      <span>Pro</span>
    </div>
  );
}

interface UpgradeBannerProps {
  className?: string;
}

export function UpgradeBanner({ className }: UpgradeBannerProps) {
  return (
    <div className={`bg-gradient-pro text-tier-pro-foreground p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <div>
            <p className="font-medium">Unlock the full SAAI platform</p>
            <p className="text-sm opacity-90">Sprint ceremonies, epic management, and team collaboration</p>
          </div>
        </div>
        <Link to="/auth">
          <Button variant="secondary" size="sm" className="bg-background/20 hover:bg-background/30 text-tier-pro-foreground border-0">
            Upgrade to Pro
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
