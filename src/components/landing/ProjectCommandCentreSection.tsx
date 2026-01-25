import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ProjectCommandCentreSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Target,
      titleKey: "landing.commandCentre.pmpTitle",
      descriptionKey: "landing.commandCentre.pmpDesc"
    },
    {
      icon: Sparkles,
      titleKey: "landing.commandCentre.aiTitle",
      descriptionKey: "landing.commandCentre.aiDesc"
    },
    {
      icon: Users,
      titleKey: "landing.commandCentre.teamTitle",
      descriptionKey: "landing.commandCentre.teamDesc"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden" aria-labelledby="command-centre-heading">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" aria-hidden="true" />
      <div className="container mx-auto max-w-5xl relative">
        <header className="text-center mb-8 space-y-4">
          <Badge className="gap-2" variant="secondary">
            <Sparkles className="h-3 w-3 animate-pulse" aria-hidden="true" />
            {t('landing.commandCentre.badge')}
          </Badge>
          <h2 id="command-centre-heading" className="text-4xl md:text-5xl font-bold">
            {t('landing.commandCentre.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('landing.commandCentre.subtitle')}
          </p>
        </header>

        <Card className="border-2 border-primary/20 shadow-elegant overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-4" role="list">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-3 items-start" role="listitem">
                      <div 
                        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                        aria-hidden="true"
                      >
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{t(feature.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t(feature.descriptionKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link to="/auth">
                    <Button 
                      size="lg" 
                      className="gap-2 w-full md:w-auto"
                      aria-label="Access the Project Command Centre"
                    >
                      {t('landing.commandCentre.accessCta')}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div 
                  className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30"
                  role="img"
                  aria-label="Project Command Centre interface showing Kanban board, task management, and progress tracking features"
                >
                  <div className="text-center space-y-2 p-8">
                    <Target className="h-16 w-16 mx-auto text-primary opacity-80" aria-hidden="true" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('landing.commandCentre.kanbanDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
