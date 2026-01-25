import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function IntegrationShowcase() {
  const { t } = useTranslation();

  const integrations = [
    {
      nameKey: "landing.integrations.github",
      icon: "🐙",
      descriptionKey: "landing.integrations.githubDesc",
      featureKeys: [
        "landing.integrations.commitSummaries",
        "landing.integrations.prTracking",
        "landing.integrations.activityHighlights",
        "landing.integrations.teamContributions"
      ],
      categoryKey: "landing.integrations.versionControl",
      popular: true,
      free: true
    },
    {
      nameKey: "landing.integrations.jira",
      icon: "🎯",
      descriptionKey: "landing.integrations.jiraDesc",
      featureKeys: [
        "landing.integrations.sprintSync",
        "landing.integrations.realtimeUpdates",
        "landing.integrations.fieldMapping",
        "landing.integrations.bulkImport"
      ],
      categoryKey: "landing.integrations.projectManagement",
      popular: true
    },
    {
      nameKey: "landing.integrations.outlook",
      icon: "📧",
      descriptionKey: "landing.integrations.outlookDesc",
      featureKeys: [
        "landing.integrations.autoSchedule",
        "landing.integrations.meetingReminders",
        "landing.integrations.calendarSync",
        "landing.integrations.attendeeManagement"
      ],
      categoryKey: "landing.integrations.communication"
    }
  ];

  return (
    <section className="py-20 px-4" aria-labelledby="integrations-heading">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-tier-free/30 text-tier-free">
            <Zap className="h-3 w-3 mr-1" />
            {t('landing.integrations.badge')}
          </Badge>
          <h2 id="integrations-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('landing.integrations.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.integrations.subtitle')}
          </p>
        </div>

        {/* Available Integrations */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.nameKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-tier-free/30 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{t(integration.nameKey)}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {t(integration.categoryKey)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {integration.free && (
                        <Badge className="bg-tier-free/10 text-tier-free border-tier-free/20">
                          {t('common.free')}
                        </Badge>
                      )}
                      {integration.popular && !integration.free && (
                        <Badge className="bg-tier-pro/10 text-tier-pro border-tier-pro/20">
                          {t('common.pro')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(integration.descriptionKey)}
                  </p>
                  
                  <ul className="space-y-2">
                    {integration.featureKeys.map((featureKey, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-tier-free shrink-0" />
                        <span>{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/integrations">
            <Button size="lg" className="group bg-tier-free hover:bg-tier-free/90">
              {t('landing.integrations.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            {t('landing.integrations.customIntegration')} <Link to="/contact" className="text-tier-free hover:underline">{t('landing.integrations.contactUs')}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
