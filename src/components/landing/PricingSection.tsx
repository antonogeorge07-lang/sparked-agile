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
            Pricing
          </Badge>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Coming Soon
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We're currently in beta and completely free to use. Pricing details will be announced soon.
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Free Beta Access
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Started Today</h3>
              <p className="text-muted-foreground mb-6 text-lg">
                SAAI is currently free during our beta phase. Sign up now to be among the first to experience 
                AI-powered Agile delivery and get notified when pricing plans launch.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex gap-3 items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Full access to all features</span>
                </div>
                <div className="flex gap-3 items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex gap-3 items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Early adopter benefits when pricing launches</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Today
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={onEarlyAccess}
                  className="w-full sm:w-auto"
                >
                  Get Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Early Adopter Benefits */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-primary text-primary-foreground border-0 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Early Adopter Benefits</h3>
              <p className="text-lg opacity-90 mb-6">
                Join during beta and receive exclusive benefits when we launch paid plans
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <p className="font-bold text-lg">Special Pricing</p>
                  <p className="text-sm opacity-90">Exclusive discounts for early users</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <p className="font-bold text-lg">Early Access</p>
                  <p className="text-sm opacity-90">Try new features first</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <p className="font-bold text-lg">Direct Input</p>
                  <p className="text-sm opacity-90">Shape the product roadmap</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
