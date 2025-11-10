import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingSectionProps {
  onEarlyAccess: () => void;
}

export function PricingSection({ onEarlyAccess }: PricingSectionProps) {
  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="pricing-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <Badge className="gap-2 mb-4" variant="secondary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Transparent Pricing
          </Badge>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Free Today. Premium Features Coming Soon.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Start free and lock in founding user benefits before we launch premium plans
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free Forever</CardTitle>
              <CardDescription className="text-base">Available now — no credit card required</CardDescription>
              <div className="pt-4">
                <p className="text-4xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">Always free</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>AI Sprint Planning (3 sprints/month)</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Basic Retrospectives</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>JIRA & GitHub Integration</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Up to 5 team members</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Community support</span>
                </div>
              </div>
              <Link to="/auth" className="block">
                <Button className="w-full" size="lg">
                  Start Free Today
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Plan - Coming Soon */}
          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
              Coming Soon
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription className="text-base">For growing teams — launching Q2 2025</CardDescription>
              <div className="pt-4">
                <p className="text-4xl font-bold">$19<span className="text-lg text-muted-foreground">/user/mo</span></p>
                <p className="text-sm text-muted-foreground">Billed monthly</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="font-semibold text-primary">Everything in Free, plus:</p>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Unlimited AI sprint planning</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Custom integrations & webhooks</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Unlimited team members</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Priority support & SLA</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                variant="outline"
                onClick={onEarlyAccess}
              >
                Get Founding User Discount
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Founding Users Benefits */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-primary text-primary-foreground border-0 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">🎁 Founding Users Benefits</h3>
              <p className="text-lg opacity-90 mb-6">
                Sign up today and lock in exclusive lifetime benefits when premium launches:
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <p className="font-bold text-lg">50% Off</p>
                  <p className="text-sm opacity-90">Lifetime discount on Premium</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <p className="font-bold text-lg">Early Access</p>
                  <p className="text-sm opacity-90">Try new features first</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <p className="font-bold text-lg">Direct Input</p>
                  <p className="text-sm opacity-90">Shape the roadmap with us</p>
                </div>
              </div>
              <Button 
                className="mt-6" 
                size="lg" 
                variant="secondary"
                onClick={onEarlyAccess}
              >
                Claim Your Founding User Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* What Stays Free */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            <span className="font-semibold">Our Promise:</span> Core features (sprint planning, retrospectives, integrations) 
            will always have a free tier. We'll never lock you out of your data.
          </p>
        </div>
      </div>
    </section>
  );
}
