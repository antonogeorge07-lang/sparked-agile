import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Sparkles, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";

export function HeroSectionSimple() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-tier-free/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-tier-free/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-float animation-delay-500" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-6">
          {/* Badge with fade-in-down */}
          <div className="opacity-0 animate-fade-in-down">
            <Badge className="gap-2 bg-tier-free/10 text-tier-free border-tier-free/20 animate-pulse-glow" variant="outline">
              <Mail className="h-3 w-3" />
              {t('landing.hero.badge')}
            </Badge>
          </div>

          {/* Headline with staggered animation */}
          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading leading-tight">
            <span className="block opacity-0 animate-fade-in-up animation-delay-100">
              {t('landing.hero.title1')}
            </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent opacity-0 animate-fade-in-up animation-delay-300">
              {t('landing.hero.title2')}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in animation-delay-400">
            {t('landing.hero.description')}
          </p>

          {/* Value props with slide-in */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground opacity-0 animate-fade-in animation-delay-500">
            <div className="flex items-center gap-1.5 opacity-0 animate-slide-in-left animation-delay-500">
              <Check className="h-4 w-4 text-tier-free" />
              <span>{t('landing.hero.setup')}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 animate-fade-in-up animation-delay-700">
              <Check className="h-4 w-4 text-tier-free" />
              <span>{t('landing.hero.noCreditCard')}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 animate-slide-in-right animation-delay-500">
              <Check className="h-4 w-4 text-tier-free" />
              <span>{t('landing.hero.freeForever')}</span>
            </div>
          </div>

          {/* CTA buttons with scale-in */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 opacity-0 animate-scale-in animation-delay-700">
            <Link to="/auth">
              <Button size="lg" className="gap-2 w-full sm:w-auto bg-tier-free hover:bg-tier-free/90 hover:scale-105 transition-transform duration-200">
                <Mail className="h-4 w-4" />
                {t('landing.hero.cta')}
              </Button>
            </Link>
            <DemoModeButton />
          </div>

          {/* Pro teaser */}
          <div className="pt-6 border-t border-border/50 mt-8 opacity-0 animate-fade-in animation-delay-1000">
            <p className="text-sm text-muted-foreground">
              {t('landing.hero.proTeaser')} <Link to="/auth" className="text-primary hover:underline font-medium">{t('landing.hero.upgradeToPro')}</Link> {t('landing.hero.proDescription')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
