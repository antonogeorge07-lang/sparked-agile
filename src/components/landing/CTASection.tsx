import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { useTranslation } from "react-i18next";

export function CTASection() {
  const { t } = useTranslation();
  const { data: userStats, isLoading: statsLoading } = useUserStats();

  return (
    <section className="py-20 px-4" aria-labelledby="cta-heading">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-gradient-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center space-y-6">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold">
              {t('landing.cta.title')}
            </h2>
            <p className="text-lg opacity-90">
              {statsLoading 
                ? t('landing.cta.descriptionLoading')
                : t('landing.cta.description', { count: userStats?.totalUsers || 0 })}
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2"
                aria-label={t('landing.cta.getFree')}
              >
                {t('landing.cta.getFree')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}