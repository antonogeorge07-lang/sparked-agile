import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Clock, ArrowRight, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface PricingSectionProps {
  onEarlyAccess: () => void;
}

export function PricingSection({ onEarlyAccess }: PricingSectionProps) {
  const { t } = useTranslation();
  const [hoveredTier, setHoveredTier] = useState<'free' | 'coming-soon' | null>(null);

  const freeTier = {
    id: 'free' as const,
    icon: Zap,
    name: t('landing.pricing.freeTitle'),
    price: t('landing.pricing.freePrice'),
    description: t('landing.pricing.freeDescription'),
    cta: t('landing.pricing.freeCta'),
    features: [
      t('landing.pricing.freeFeature1'),
      t('landing.pricing.freeFeature2'),
      t('landing.pricing.freeFeature3'),
      t('landing.pricing.freeFeature4'),
      "Sprint Ceremonies",
      "AI Standup Summaries", 
      "Epic Management",
      "Team Collaboration",
      "Retrospective Insights",
      "Advanced Analytics",
      "Stakeholder Portal",
      "SAFe Workflows",
      "Executive Digest",
    ],
  };

  const comingSoonFeatures = [
    { name: "White-label Branding", status: "Planned" },
    { name: "Enterprise SSO (SAML)", status: "Planned" },
    { name: "Priority Support Tiers", status: "Planned" },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden" aria-labelledby="pricing-heading">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-50 pointer-events-none bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="text-center mb-12">
          <Badge className="gap-2 mb-4" variant="secondary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {t('landing.pricing.badge')}
          </Badge>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold font-heading mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <Card 
            className={`relative overflow-hidden transition-all duration-300 border-2 border-border
              ${hoveredTier === 'free' ? 'scale-[1.02] shadow-elevated' : 'hover:shadow-card'}`}
            onMouseEnter={() => setHoveredTier('free')}
            onMouseLeave={() => setHoveredTier(null)}
          >
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 
              ${hoveredTier === 'free' ? 'opacity-100' : ''} bg-gradient-to-br from-tier-free/5 to-transparent`} 
            />

            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-tier-free/10">
                  <Zap className="h-5 w-5 text-tier-free" />
                </div>
                <h3 className="text-xl font-bold">{freeTier.name}</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold">{freeTier.price}</span>
                <span className="text-muted-foreground">{t('landing.pricing.perMonth')}</span>
              </div>
              
              <p className="text-muted-foreground mb-6 text-sm">{freeTier.description}</p>
              
              <Link to="/auth" className="block mb-6">
                <Button 
                  size="lg" 
                  className="w-full gap-2 group"
                  variant="outline"
                >
                  {freeTier.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <div className="space-y-3">
                {freeTier.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex gap-3 items-center text-sm"
                  >
                    <Check className="h-4 w-4 shrink-0 text-tier-free" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon - What's Being Built */}
          <Card 
            className={`relative overflow-hidden transition-all duration-300 border-2 border-dashed border-muted-foreground/30
              ${hoveredTier === 'coming-soon' ? 'scale-[1.02] shadow-elevated' : 'hover:shadow-card'}`}
            onMouseEnter={() => setHoveredTier('coming-soon')}
            onMouseLeave={() => setHoveredTier(null)}
          >
            <div className="absolute top-0 right-0 bg-muted text-muted-foreground text-xs font-medium px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              In Progress
            </div>
            
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 
              ${hoveredTier === 'coming-soon' ? 'opacity-100' : ''} bg-gradient-to-br from-muted/30 to-transparent`} 
            />

            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Coming Soon</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-muted-foreground">Launching in 30 days</span>
              </div>
              
              <p className="text-muted-foreground mb-6 text-sm">
                Features currently being developed by Faith Invictus Studio
              </p>
              
              <Button 
                size="lg" 
                className="w-full gap-2 mb-6"
                variant="secondary"
                onClick={onEarlyAccess}
              >
                Get Notified When Ready
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <div className="space-y-3">
                {comingSoonFeatures.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex gap-3 items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{feature.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {feature.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Beta banner - simplified */}
        <div className="mt-10 text-center">
          <Card className="inline-block bg-gradient-to-r from-tier-free/10 via-primary/10 to-muted/20 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-left">
                <h3 className="font-bold mb-1">{t('landing.pricing.betaAccess')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.pricing.betaDescription')}</p>
              </div>
              <Button variant="secondary" onClick={onEarlyAccess} className="shrink-0">
                {t('landing.pricing.getNotified')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}