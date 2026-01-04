import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Mail, GitBranch, BarChart3, Zap, Users, Target, Calendar, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CapabilityShowcase() {
  const { t } = useTranslation();

  const freeCapabilities = [
    {
      icon: Mail,
      titleKey: "landing.capabilities.dailyDigest",
      descKey: "landing.capabilities.dailyDigestDesc",
    },
    {
      icon: GitBranch,
      titleKey: "landing.capabilities.githubActivity",
      descKey: "landing.capabilities.githubActivityDesc",
    },
    {
      icon: BarChart3,
      titleKey: "landing.capabilities.sprintHighlights",
      descKey: "landing.capabilities.sprintHighlightsDesc",
    },
    {
      icon: Zap,
      titleKey: "landing.capabilities.basicAI",
      descKey: "landing.capabilities.basicAIDesc",
    },
  ];

  const proCapabilities = [
    {
      icon: Calendar,
      titleKey: "landing.capabilities.sprintCeremonies",
      descKey: "landing.capabilities.sprintCeremoniesDesc",
    },
    {
      icon: Target,
      titleKey: "landing.capabilities.epicManagement",
      descKey: "landing.capabilities.epicManagementDesc",
    },
    {
      icon: Users,
      titleKey: "landing.capabilities.teamCollaboration",
      descKey: "landing.capabilities.teamCollaborationDesc",
    },
    {
      icon: MessageSquare,
      titleKey: "landing.capabilities.aiSprintPlanning",
      descKey: "landing.capabilities.aiSprintPlanningDesc",
    },
  ];

  return (
    <section className="py-16 px-4 bg-muted/30" aria-labelledby="capabilities-heading">
      <div className="container mx-auto max-w-6xl">
        {/* Free Tier */}
        <div className="mb-12">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 opacity-0 animate-fade-in">
              <TierBadge tier="free" />
              <span className="text-sm text-muted-foreground">{t('landing.capabilities.freeIncluded')}</span>
            </div>
            <h2 id="capabilities-heading" className="text-2xl md:text-3xl font-bold font-heading mb-3 opacity-0 animate-fade-in-up animation-delay-100">
              {t('landing.capabilities.freeTitle')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto opacity-0 animate-fade-in animation-delay-200">
              {t('landing.capabilities.freeDescription')}
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {freeCapabilities.map((cap, index) => (
              <Card 
                key={index} 
                className={`p-5 hover:border-tier-free/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border-tier-free/20 opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-tier-free/10 flex items-center justify-center group-hover:bg-tier-free/20 group-hover:scale-110 transition-all duration-300">
                    <cap.icon className="h-5 w-5 text-tier-free" />
                  </div>
                </div>
                <h3 className="font-semibold font-heading mb-1">{t(cap.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(cap.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Pro Tier */}
        <div>
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 opacity-0 animate-fade-in animation-delay-700">
              <TierBadge tier="pro" />
              <Badge variant="secondary" className="text-xs">{t('landing.capabilities.betaFree')}</Badge>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-heading mb-3 opacity-0 animate-fade-in-up animation-delay-700">
              {t('landing.capabilities.proTitle')}
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto opacity-0 animate-fade-in animation-delay-700">
              {t('landing.capabilities.proDescription')}
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proCapabilities.map((cap, index) => (
              <Card 
                key={index} 
                className={`p-5 hover:border-tier-pro/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border-tier-pro/20 bg-card/50 opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-tier-pro/10 flex items-center justify-center group-hover:bg-tier-pro/20 group-hover:scale-110 transition-all duration-300">
                    <cap.icon className="h-5 w-5 text-tier-pro" />
                  </div>
                </div>
                <h3 className="font-semibold font-heading mb-1">{t(cap.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(cap.descKey)}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
