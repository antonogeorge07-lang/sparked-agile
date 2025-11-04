import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Crown, Zap, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  workspace_limit: number;
  team_member_limit: number;
  project_limit: number;
  features: string[];
}

interface UserSubscription {
  status: string;
  tier_id: string;
  current_period_end: string;
}

export default function Subscription() {
  const [isLoading, setIsLoading] = useState(true);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadSubscriptionData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadSubscriptionData = async () => {
    try {
      // Load subscription tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (tiersError) throw tiersError;
      
      // Parse features from JSON to string array
      const parsedTiers = (tiersData || []).map(tier => ({
        id: tier.id,
        name: tier.name,
        price_monthly: tier.price_monthly,
        price_yearly: tier.price_yearly,
        workspace_limit: tier.workspace_limit,
        team_member_limit: tier.team_member_limit,
        project_limit: tier.project_limit || 1,
        features: (Array.isArray(tier.features) ? tier.features : []) as string[]
      }));
      
      setTiers(parsedTiers);

      // Load user's current subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setCurrentSubscription(subData);
      }
    } catch (error: any) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    // Ready for Stripe - will activate when you add your Stripe account
    toast({
      title: "Payment Setup Required",
      description: "Connect your Stripe account to enable subscription payments. The integration is ready to go!",
      variant: "default",
    });
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free': return Zap;
      case 'professional': return Crown;
      case 'enterprise': return Building2;
      default: return Zap;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Scale your agile workspace with the perfect plan for your team
            </p>
            
            <div className="inline-flex rounded-lg border p-1 bg-muted/50">
              <Button
                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingPeriod('yearly')}
              >
                Yearly
                <Badge variant="secondary" className="ml-2">Save 17%</Badge>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = getTierIcon(tier.name);
              const price = billingPeriod === 'monthly' ? tier.price_monthly : tier.price_yearly;
              const isCurrentPlan = currentSubscription?.tier_id === tier.id;
              const isFree = tier.name.toLowerCase() === 'free';

              return (
                <Card 
                  key={tier.id} 
                  className={`relative overflow-hidden transition-all hover:shadow-elevated ${
                    tier.name.toLowerCase() === 'professional' 
                      ? 'border-primary shadow-lg scale-105' 
                      : ''
                  }`}
                >
                  {tier.name.toLowerCase() === 'professional' && (
                    <div className="absolute top-0 right-0 bg-gradient-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-semibold">
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold text-foreground">
                          ${price.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        Up to {tier.project_limit === 9999 ? 'unlimited' : tier.project_limit} projects
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold mb-3">Key Features:</div>
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      variant={tier.name.toLowerCase() === 'professional' ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started' : 'Upgrade Now'}
                    </Button>

                    {isCurrentPlan && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need a custom solution for your enterprise?
            </p>
            <Button variant="outline" onClick={() => toast({
              title: "Contact Sales",
              description: "Please reach out to sales@smactiveintelligence.com for enterprise inquiries."
            })}>
              Contact Sales
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}