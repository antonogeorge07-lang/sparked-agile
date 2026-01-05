import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface PricingSectionProps {
  onEarlyAccess: () => void;
}

export function PricingSection({ onEarlyAccess }: PricingSectionProps) {
  const { t } = useTranslation();

  const freeTierFeatures = [
    t('landing.pricing.freeFeature1'),
    t('landing.pricing.freeFeature2'),
    t('landing.pricing.freeFeature3'),
    t('landing.pricing.freeFeature4'),
    t('landing.pricing.freeFeature5'),
    t('landing.pricing.freeFeature6'),
  ];

  const proTierFeatures = [
    t('landing.pricing.proFeature1'),
    t('landing.pricing.proFeature2'),
    t('landing.pricing.proFeature3'),
    t('landing.pricing.proFeature4'),
    t('landing.pricing.proFeature5'),
    t('landing.pricing.proFeature6'),
    t('landing.pricing.proFeature7'),
    t('landing.pricing.proFeature8'),
    t('landing.pricing.proFeature9'),
    t('landing.pricing.proFeature10'),
  ];

  return (
    <section className="py-20 px-4 bg-muted/30" aria-labelledby="pricing-heading">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <Badge className="gap-2 mb-4" variant="secondary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {t('landing.pricing.badge')}
          </Badge>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.pricing.subtitle')}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 border-border relative">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">{t('landing.pricing.freeTitle')}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t('landing.pricing.freePrice')}</span>
                <span className="text-muted-foreground">{t('landing.pricing.perMonth')}</span>
              </div>
              <p className="text-muted-foreground mb-6">
                {t('landing.pricing.freeDescription')}
              </p>
              <Link to="/auth" className="block mb-6">
                <Button size="lg" variant="outline" className="w-full">
                  {t('landing.pricing.freeCta')}
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

          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              {t('common.mostPopular')}
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">{t('landing.pricing.proTitle')}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t('landing.pricing.proPrice')}</span>
                <span className="text-muted-foreground">{t('landing.pricing.perMonth')}</span>
                <Badge variant="secondary" className="ml-2">{t('landing.capabilities.betaFree')}</Badge>
              </div>
              <p className="text-muted-foreground mb-6">
                {t('landing.pricing.proDescription')}
              </p>
              <Link to="/auth" className="block mb-6">
                <Button size="lg" className="w-full">
                  {t('landing.pricing.proCta')}
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

        <div className="mt-12 text-center">
          <Card className="bg-gradient-primary text-primary-foreground border-0 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{t('landing.pricing.betaAccess')}</h3>
              <p className="opacity-90">
                {t('landing.pricing.betaDescription')}
              </p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={onEarlyAccess}
              >
                {t('landing.pricing.getNotified')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}