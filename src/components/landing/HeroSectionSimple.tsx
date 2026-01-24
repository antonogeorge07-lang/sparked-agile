import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function HeroSectionSimple() {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-tier-free/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-float animation-delay-500" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-tier-pro/10 rounded-full blur-[80px] animate-float animation-delay-300" />
      </div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-8">
          {/* Animated badge */}
          <div className="inline-flex opacity-0 animate-fade-in-down">
            <Badge 
              className="gap-2 px-4 py-1.5 bg-gradient-to-r from-tier-free/10 to-primary/10 text-foreground border-tier-free/30 hover:scale-105 transition-transform cursor-default" 
              variant="outline"
            >
              <Sparkles className="h-3.5 w-3.5 text-tier-free animate-pulse" />
              <span className="text-sm font-medium">{t('landing.hero.badge')}</span>
            </Badge>
          </div>

          {/* Headline - bigger, bolder */}
          <h1 id="hero-heading" className="text-5xl sm:text-6xl md:text-7xl font-bold font-heading leading-[1.1] tracking-tight">
            <span className="block opacity-0 animate-fade-in-up animation-delay-100">
              {t('landing.hero.title1')}
            </span>
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent opacity-0 animate-fade-in-up animation-delay-300">
              {t('landing.hero.title2')}
            </span>
          </h1>

          {/* Subheading - concise */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto opacity-0 animate-fade-in animation-delay-400 leading-relaxed">
            {t('landing.hero.description')}
          </p>

          {/* Interactive CTA group */}
          <div 
            className="relative inline-flex flex-col sm:flex-row gap-4 pt-2 opacity-0 animate-scale-in animation-delay-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link to="/auth">
              <Button 
                size="lg" 
                className={`gap-2 px-8 h-14 text-base bg-tier-free hover:bg-tier-free/90 shadow-lg hover:shadow-xl transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
              >
                <Mail className="h-5 w-5" />
                {t('landing.hero.cta')}
                <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
            </Link>
            <DemoModeButton />
          </div>

          {/* Trust indicators - minimal */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-4 opacity-0 animate-fade-in animation-delay-700">
            {['landing.hero.setup', 'landing.hero.noCreditCard', 'landing.hero.freeForever'].map((key, i) => (
              <div 
                key={key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <Zap className="h-3.5 w-3.5 text-tier-free" />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
