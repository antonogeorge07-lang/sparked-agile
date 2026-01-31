import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function HeroSectionSimple() {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-12 sm:py-20 md:py-28 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] animate-float" />
        <div className="absolute top-20 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-primary/5 rounded-full blur-[100px] sm:blur-[120px] animate-float animation-delay-500" />
      </div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-5 sm:space-y-8">
          {/* Honest badge */}
          <div className="inline-flex opacity-0 animate-fade-in-down">
            <Badge 
              className="gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-primary/5 text-foreground border-primary/20 cursor-default" 
              variant="outline"
            >
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
              <span className="text-xs sm:text-sm font-medium">{t('landing.hero.badge')}</span>
            </Badge>
          </div>

          {/* Authentic headline */}
          <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-[1.15] tracking-tight">
          <span className="block opacity-0 animate-fade-in-up animation-delay-100">
            Spark-Agile
            <br />
            Active Intelligence
          </span>
            <span className="block mt-2 text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium opacity-0 animate-fade-in-up animation-delay-300">
              {t('landing.hero.title2')}
            </span>
          </h1>

          {/* Honest description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in animation-delay-400 leading-relaxed px-2">
            {t('landing.hero.description')}
          </p>

          {/* Clean CTA group */}
          <div 
            className="relative inline-flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 opacity-0 animate-scale-in animation-delay-500 w-full sm:w-auto px-4 sm:px-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className={`gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto ${isHovered ? 'scale-105' : ''}`}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('landing.hero.cta')}
                <ArrowRight className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
            </Link>
            <DemoModeButton />
          </div>

          {/* Simple trust indicators */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-2 sm:pt-4 opacity-0 animate-fade-in animation-delay-700">
            {['landing.hero.setup', 'landing.hero.noCreditCard', 'landing.hero.freeForever'].map((key) => (
              <div 
                key={key}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
