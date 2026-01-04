import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function SimpleCTA() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4" aria-labelledby="cta-heading">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('landing.cta.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth">
            <Button size="lg" className="gap-2 bg-tier-free hover:bg-tier-free/90 w-full sm:w-auto">
              <Mail className="h-4 w-4" />
              {t('landing.cta.getFree')}
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="gap-2 border-tier-pro/30 text-tier-pro hover:bg-tier-pro/10 w-full sm:w-auto">
              <Crown className="h-4 w-4" />
              {t('landing.cta.explorePro')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
