import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
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
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      // Load subscription tiers (public data)
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

      // Load user's current subscription (only if authenticated)
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    
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

  const getTierEmoji = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free': return '🟢';
      case 'professional': return '🔵';
      case 'enterprise': return '🟣';
      default: return '⚡';
    }
  };

  const getTierTagline = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'free': return 'Ideal for individuals or small teams getting started with agile';
      case 'professional': return 'Best for growing teams ready to automate and optimize their agile delivery';
      case 'enterprise': return 'Designed for large organizations that need scale, security, and customization';
      default: return '';
    }
  };

  const getButtonText = (tierName: string, isCurrentPlan: boolean) => {
    if (isCurrentPlan) return 'Current Plan';
    switch (tierName.toLowerCase()) {
      case 'free': return 'Start Free';
      case 'professional': return 'Upgrade Now';
      case 'enterprise': return 'Contact Sales';
      default: return 'Get Started';
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
          <BackButton className="mb-6" />
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-2 px-2">
              From solo founders to enterprise teams, Spark Agile grows with you
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-primary bg-clip-text text-transparent px-2">
              ⚡ Choose Your Plan
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4 sm:mb-6 px-2">
              Scale your agile workspace with the perfect plan for your team, from startup simplicity to enterprise performance
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tiers.map((tier) => {
              const Icon = getTierIcon(tier.name);
              const emoji = getTierEmoji(tier.name);
              const tagline = getTierTagline(tier.name);
              const price = billingPeriod === 'monthly' ? tier.price_monthly : tier.price_yearly;
              const isCurrentPlan = currentSubscription?.tier_id === tier.id;
              const buttonText = getButtonText(tier.name, isCurrentPlan);

              return (
                <Card 
                  key={tier.id} 
                  className={`relative overflow-hidden transition-all hover:shadow-elevated ${
                    tier.name.toLowerCase() === 'professional' 
                      ? 'border-primary shadow-lg lg:scale-105' 
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
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span>{emoji}</span> {tier.name}
                    </CardTitle>
                    <CardDescription>
                      <div className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                        {tagline}
                      </div>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold text-foreground">
                          ${price.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold mb-3">Includes:</div>
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground italic">
                      {tier.name.toLowerCase() === 'free' && "Start your agile journey and build momentum with the essentials."}
                      {tier.name.toLowerCase() === 'professional' && "Boost team velocity with AI-driven clarity and smarter collaboration."}
                      {tier.name.toLowerCase() === 'enterprise' && "Empower your organization with a personalized AI coach and full agile ecosystem."}
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      variant={tier.name.toLowerCase() === 'professional' ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(tier.id)}
                      disabled={isCurrentPlan}
                    >
                      {buttonText}
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

          {/* Add-Ons Section */}
          <div className="mt-12 sm:mt-16">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 px-2">💡 Add-Ons (Optional)</h2>
              <p className="text-muted-foreground text-sm sm:text-base px-2">Enhance your Professional plan with these powerful extras</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">AI-Powered Agile Coach</CardTitle>
                  <CardDescription>For Professional Plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">+$9<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground">Get personalized agile coaching and advanced automation for your team</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Custom Branding</CardTitle>
                  <CardDescription>White-label solution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">+$5<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground">Add your company logo, colors, and branding to the platform</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Analytics Dashboard</CardTitle>
                  <CardDescription>Deep insights & reporting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">+$7<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <p className="text-sm text-muted-foreground">Unlock predictive analytics, custom reports, and team performance metrics</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Partner Section */}
          <div className="mt-12 sm:mt-16">
            <Card className="bg-gradient-primary text-primary-foreground border-0">
              <CardContent className="p-6 sm:p-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">✨ Your AI Partner in Every Sprint</h2>
                <p className="text-base sm:text-lg opacity-90 mb-3 sm:mb-4">
                  Every plan includes Spark Agile's AI Chatbot, your virtual Scrum assistant that helps you plan, prioritize, and deliver faster.
                </p>
                <p className="text-sm sm:text-base opacity-80">
                  Unlock advanced coaching, automation, and insights with Professional or Enterprise.
                </p>
              </CardContent>
            </Card>
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