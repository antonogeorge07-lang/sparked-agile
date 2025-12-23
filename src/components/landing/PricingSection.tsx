import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingSectionProps {
  onEarlyAccess: () => void;
}

const freeTierFeatures = [
  "Daily Digest emails",
  "GitHub activity summaries",
  "Sprint highlights",
  "1 project",
  "Basic AI insights",
  "Email support",
];

const proTierFeatures = [
  "Everything in Free",
  "Unlimited projects",
  "Standup automation",
  "Sprint ceremonies",
  "Epic management",
  "Retrospective insights",
  "Team collaboration",
  "Advanced AI analytics",
  "Priority support",
  "Custom integrations",
];

export function PricingSection({ onEarlyAccess }: PricingSectionProps) {
  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="pricing-heading">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <Badge className="gap-2 mb-4" variant="secondary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Pricing
          </Badge>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Start Free, Scale When Ready
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Get your Daily Digest free forever. Upgrade to Pro when you need the full Agile platform.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="border-2 border-border relative">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Free</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Daily Digest to keep your team informed. Perfect for small teams getting started.
              </p>
              <Link to="/auth" className="block mb-6">
                <Button size="lg" variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
              <div className="space-y-3">
                {freeTierFeatures.map((feature) => (
                  <div key={feature} className="flex gap-3 items-center">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              Most Popular
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Pro</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
                <Badge variant="secondary" className="ml-2">Beta: Free</Badge>
              </div>
              <p className="text-muted-foreground mb-6">
                Full SAAI platform with ceremonies, epics, and team collaboration tools.
              </p>
              <Link to="/auth" className="block mb-6">
                <Button size="lg" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
              <div className="space-y-3">
                {proTierFeatures.map((feature) => (
                  <div key={feature} className="flex gap-3 items-center">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Early Adopter Note */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-primary text-primary-foreground border-0 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Beta Access</h3>
              <p className="opacity-90">
                Both tiers are currently free during beta. Lock in early adopter pricing when we launch.
              </p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={onEarlyAccess}
              >
                Get Notified at Launch
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
