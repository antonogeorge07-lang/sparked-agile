import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Users, Target, Shield } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useTranslation } from "react-i18next";

export function ValuePropositionSection() {
  const { t } = useTranslation();
  const { data: userStats, isLoading: statsLoading } = useUserStats();

  const roles = [
    {
      icon: Users,
      titleKey: "landing.value.scrumMasters",
      descriptionKey: "landing.value.scrumMastersDesc",
      featureKeys: [
        "landing.value.scrumFeature1",
        "landing.value.scrumFeature2",
        "landing.value.scrumFeature3",
        "landing.value.scrumFeature4"
      ],
      highlighted: false
    },
    {
      icon: Target,
      titleKey: "landing.value.projectManagers",
      descriptionKey: "landing.value.projectManagersDesc",
      featureKeys: [
        "landing.value.pmFeature1",
        "landing.value.pmFeature2",
        "landing.value.pmFeature3",
        "landing.value.pmFeature4"
      ],
      highlighted: true
    },
    {
      icon: Shield,
      titleKey: "landing.value.stakeholders",
      descriptionKey: "landing.value.stakeholdersDesc",
      featureKeys: [
        "landing.value.stakeholderFeature1",
        "landing.value.stakeholderFeature2",
        "landing.value.stakeholderFeature3",
        "landing.value.stakeholderFeature4"
      ],
      highlighted: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-card/50" aria-labelledby="value-prop-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8 sm:mb-12">
          <h2 id="value-prop-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
            {t('landing.value.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
            {t('landing.value.subtitle')}
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {roles.map((role, index) => (
            <Card 
              key={index}
              className={`border-2 hover:shadow-elegant transition-all ${
                role.highlighted ? 'border-primary/50' : ''
              }`}
            >
              <CardHeader>
                <div 
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    role.highlighted ? 'bg-primary' : 'bg-primary/10'
                  }`}
                  aria-hidden="true"
                >
                  <role.icon 
                    className={`h-6 w-6 ${
                      role.highlighted ? 'text-primary-foreground' : 'text-primary'
                    }`}
                  />
                </div>
                <CardTitle className="text-2xl">{t(role.titleKey)}</CardTitle>
                <CardDescription className="text-base">
                  {t(role.descriptionKey)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-3" role="list">
                  {role.featureKeys.map((featureKey, featureIndex) => (
                    <li key={featureIndex} className="flex gap-2 items-start">
                      <Check 
                        className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" 
                        aria-hidden="true"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t(featureKey)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Stats */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center" role="region" aria-label="Platform statistics">
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label={`${statsLoading ? 'Loading' : userStats?.totalUsers || 0} active users`}>
              {statsLoading ? "..." : userStats?.totalUsers || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.value.activeUsers')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label={`${statsLoading ? 'Loading' : userStats?.locations.length || 0} countries`}>
              {statsLoading ? "..." : userStats?.locations.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.value.countries')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label={`Plus ${statsLoading ? 'loading' : userStats?.recentSignups || 0} new users this month`}>
              {statsLoading ? "..." : `+${userStats?.recentSignups || 0}`}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.value.newThisMonth')}</p>
          </div>
          <div className="space-y-2">
             <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label="Live platform">
              {t('common.beta')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('landing.value.betaPhase')}</p>
          </div>
        </div>

        {/* User Locations */}
        {!statsLoading && userStats && userStats.locations.length > 0 && (
          <div className="mt-12 p-6 rounded-lg bg-card border">
            <h3 className="text-lg font-semibold mb-4 text-center">{t('landing.value.globalCommunity')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {userStats.locations.map(loc => (
                <div key={loc.location} className="text-center space-y-1">
                  <p className="text-2xl font-bold text-primary">{loc.count}</p>
                  <p className="text-xs text-muted-foreground">{loc.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
