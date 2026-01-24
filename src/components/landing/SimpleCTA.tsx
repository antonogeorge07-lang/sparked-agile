import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function SimpleCTA() {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-20 px-4 relative overflow-hidden" aria-labelledby="cta-heading">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-tier-free/10 via-primary/5 to-tier-pro/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div 
        className="container mx-auto max-w-2xl text-center relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`transition-transform duration-500 ${isHovered ? 'scale-[1.02]' : ''}`}>
          <Sparkles className="h-8 w-8 text-tier-free mx-auto mb-4 animate-bounce-subtle" />
          
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold font-heading mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            {t('landing.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="gap-2 px-8 h-14 text-base bg-tier-free hover:bg-tier-free/90 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Mail className="h-5 w-5" />
                {t('landing.cta.getFree')}
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 h-14 text-base border-tier-pro/30 text-tier-pro hover:bg-tier-pro/10 group w-full sm:w-auto"
              >
                <Crown className="h-5 w-5" />
                {t('landing.cta.explorePro')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
