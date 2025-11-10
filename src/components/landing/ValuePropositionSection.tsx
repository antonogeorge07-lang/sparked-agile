import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Users, Target, Shield } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

export function ValuePropositionSection() {
  const { data: userStats, isLoading: statsLoading } = useUserStats();

  const roles = [
    {
      icon: Users,
      title: "For Scrum Masters",
      description: "Orchestrate ceremonies with confidence",
      features: [
        "Automate standup summaries and track blockers in real-time",
        "Generate sprint plans from JIRA with AI-powered velocity analysis",
        "Run productive retrospectives with anonymous feedback and AI insights",
        "Schedule and coordinate all ceremonies with Outlook integration"
      ],
      highlighted: false
    },
    {
      icon: Target,
      title: "For Project Managers",
      description: "Drive projects to successful completion",
      features: [
        "Monitor project health with flow metrics and burndown charts",
        "Identify risks early with AI-powered backlog analysis",
        "Track team velocity and predictability across multiple sprints",
        "Generate executive-ready reports with one click"
      ],
      highlighted: true
    },
    {
      icon: Shield,
      title: "For Stakeholders",
      description: "Stay informed without the noise",
      features: [
        "Access real-time dashboards showing project progress and milestones",
        "Review sprint outcomes and team achievements at a glance",
        "Get automated summaries and insights without attending every meeting",
        "Make data-driven decisions with AI-generated recommendations"
      ],
      highlighted: false
    }
  ];

  return (
    <section className="py-20 px-4 bg-card/50" aria-labelledby="value-prop-heading">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8 sm:mb-12">
          <h2 id="value-prop-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
            Built for Modern Agile Teams
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
            Whether you're running sprints, managing stakeholders, or driving project success, 
            SAAI adapts to your workflow and amplifies your impact
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
                <CardTitle className="text-2xl">{role.title}</CardTitle>
                <CardDescription className="text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-3" role="list">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex gap-2 items-start">
                      <Check 
                        className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" 
                        aria-hidden="true"
                      />
                      <span className="text-sm text-muted-foreground">
                        {feature}
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
            <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label={`${statsLoading ? 'Loading' : userStats?.locations.length || 0} countries`}>
              {statsLoading ? "..." : userStats?.locations.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Countries</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label={`Plus ${statsLoading ? 'loading' : userStats?.recentSignups || 0} new users this month`}>
              {statsLoading ? "..." : `+${userStats?.recentSignups || 0}`}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">New users this month</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent" aria-label="100% team satisfaction">
              100%
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Team satisfaction</p>
          </div>
        </div>

        {/* User Locations */}
        {!statsLoading && userStats && userStats.locations.length > 0 && (
          <div className="mt-12 p-6 rounded-lg bg-card border">
            <h3 className="text-lg font-semibold mb-4 text-center">Our Global Community</h3>
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
