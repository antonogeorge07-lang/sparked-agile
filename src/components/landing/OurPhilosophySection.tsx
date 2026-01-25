import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Users, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

export function OurPhilosophySection() {
  const { t } = useTranslation();

  const philosophyPoints = [
    {
      icon: Heart,
      titleKey: "landing.philosophy.humanFirst",
      descriptionKey: "landing.philosophy.humanFirstDesc"
    },
    {
      icon: Brain,
      titleKey: "landing.philosophy.activeIntelligence",
      descriptionKey: "landing.philosophy.activeIntelligenceDesc"
    },
    {
      icon: Users,
      titleKey: "landing.philosophy.teamsOverTools",
      descriptionKey: "landing.philosophy.teamsOverToolsDesc"
    },
    {
      icon: Lightbulb,
      titleKey: "landing.philosophy.honestLimits",
      descriptionKey: "landing.philosophy.honestLimitsDesc"
    }
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('landing.philosophy.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.philosophy.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {philosophyPoints.map((point) => {
            const Icon = point.icon;
            return (
              <Card key={point.titleKey} className="border-none shadow-sm bg-background/50 hover:bg-background/80 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t(point.titleKey)}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {t(point.descriptionKey)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground italic">
            {t('landing.philosophy.quote')}
          </p>
        </div>
      </div>
    </section>
  );
}
