import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, GitBranch, BarChart, Calendar, Users, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const featureCategories = [
    {
      category: t('landing.features.aiPlanning'),
      features: [
        {
          icon: Sparkles,
          title: t('landing.features.sprintAssistant'),
          description: t('landing.features.sprintAssistantDesc')
        },
        {
          icon: BarChart,
          title: t('landing.features.backlogAnalysis'),
          description: t('landing.features.backlogAnalysisDesc')
        }
      ]
    },
    {
      category: t('landing.features.epicProject'),
      features: [
        {
          icon: GitBranch,
          title: t('landing.features.epicTracking'),
          description: t('landing.features.epicTrackingDesc')
        },
        {
          icon: Target,
          title: t('landing.features.commandCentre'),
          description: t('landing.features.commandCentreDesc')
        }
      ]
    },
    {
      category: t('landing.features.ceremonies'),
      features: [
        {
          icon: Calendar,
          title: t('landing.features.retroManagement'),
          description: t('landing.features.retroManagementDesc')
        },
        {
          icon: Users,
          title: t('landing.features.dailyStandups'),
          description: t('landing.features.dailyStandupsDesc')
        }
      ]
    },
    {
      category: t('landing.features.integrationWorkflows'),
      features: [
        {
          icon: Zap,
          title: t('landing.features.seamlessIntegrations'),
          description: t('landing.features.seamlessIntegrationsDesc')
        },
        {
          icon: BarChart,
          title: t('landing.features.teamAnalytics'),
          description: t('landing.features.teamAnalyticsDesc')
        }
      ]
    }
  ];

  return (
    <section className="py-20 px-4" aria-labelledby="features-heading">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.features.subtitle')}
          </p>
        </header>
        
        <div className="space-y-16">
          {featureCategories.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-2xl font-bold mb-6 text-primary">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.features.map((feature, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0"
                          aria-hidden="true"
                        >
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                          <CardDescription className="text-base">{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}