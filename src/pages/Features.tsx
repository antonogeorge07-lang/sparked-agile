import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { ElementType } from "react";
import { 
  Clock, MessageSquareOff, BarChart3, Brain, Users, Target, 
  GitBranch, Calendar, Zap, ArrowRight, CheckCircle2 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "@/components/OptimizedImage";
import saaiLogo from "@/assets/saai-logo.png";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface PainPointSection {
  painPoint: string;
  description: string;
  icon: ElementType;
  features: {
    title: string;
    description: string;
    icon: ElementType;
  }[];
}

export default function Features() {
  const { t } = useTranslation();

  const painPointSections: PainPointSection[] = [
    {
      painPoint: t('features.painPoints.meetingChaos.title'),
      description: t('features.painPoints.meetingChaos.description'),
      icon: MessageSquareOff,
      features: [
        {
          title: t('features.painPoints.meetingChaos.features.aiStandup.title'),
          description: t('features.painPoints.meetingChaos.features.aiStandup.description'),
          icon: Brain
        },
        {
          title: t('features.painPoints.meetingChaos.features.asyncUpdates.title'),
          description: t('features.painPoints.meetingChaos.features.asyncUpdates.description'),
          icon: Clock
        }
      ]
    },
    {
      painPoint: t('features.painPoints.progressTracking.title'),
      description: t('features.painPoints.progressTracking.description'),
      icon: Target,
      features: [
        {
          title: t('features.painPoints.progressTracking.features.commandCentre.title'),
          description: t('features.painPoints.progressTracking.features.commandCentre.description'),
          icon: BarChart3
        },
        {
          title: t('features.painPoints.progressTracking.features.epicTracking.title'),
          description: t('features.painPoints.progressTracking.features.epicTracking.description'),
          icon: GitBranch
        }
      ]
    },
    {
      painPoint: t('features.painPoints.manualReporting.title'),
      description: t('features.painPoints.manualReporting.description'),
      icon: Clock,
      features: [
        {
          title: t('features.painPoints.manualReporting.features.aiDigest.title'),
          description: t('features.painPoints.manualReporting.features.aiDigest.description'),
          icon: Zap
        },
        {
          title: t('features.painPoints.manualReporting.features.autoMetrics.title'),
          description: t('features.painPoints.manualReporting.features.autoMetrics.description'),
          icon: BarChart3
        }
      ]
    },
    {
      painPoint: t('features.painPoints.contextSwitching.title'),
      description: t('features.painPoints.contextSwitching.description'),
      icon: GitBranch,
      features: [
        {
          title: t('features.painPoints.contextSwitching.features.unifiedView.title'),
          description: t('features.painPoints.contextSwitching.features.unifiedView.description'),
          icon: Target
        },
        {
          title: t('features.painPoints.contextSwitching.features.integrations.title'),
          description: t('features.painPoints.contextSwitching.features.integrations.description'),
          icon: Zap
        }
      ]
    },
    {
      painPoint: t('features.painPoints.stakeholderComms.title'),
      description: t('features.painPoints.stakeholderComms.description'),
      icon: Users,
      features: [
        {
          title: t('features.painPoints.stakeholderComms.features.portal.title'),
          description: t('features.painPoints.stakeholderComms.features.portal.description'),
          icon: Users
        },
        {
          title: t('features.painPoints.stakeholderComms.features.approvals.title'),
          description: t('features.painPoints.stakeholderComms.features.approvals.description'),
          icon: CheckCircle2
        }
      ]
    },
    {
      painPoint: t('features.painPoints.sprintPlanning.title'),
      description: t('features.painPoints.sprintPlanning.description'),
      icon: Calendar,
      features: [
        {
          title: t('features.painPoints.sprintPlanning.features.aiPlanning.title'),
          description: t('features.painPoints.sprintPlanning.features.aiPlanning.description'),
          icon: Brain
        },
        {
          title: t('features.painPoints.sprintPlanning.features.ceremonies.title'),
          description: t('features.painPoints.sprintPlanning.features.ceremonies.description'),
          icon: Calendar
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-2 rounded-xl border border-primary/10">
                <OptimizedImage 
                  src={saaiLogo} 
                  alt="SAAI" 
                  className="h-7 w-7 object-contain"
                  priority={true}
                />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SAAI
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to="/auth">
                <Button size="sm">
                  {t("landing.getStarted", "Get Started")}
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('features.hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Pain Point Sections */}
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-5xl space-y-16">
          {painPointSections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="scroll-mt-20" id={`pain-${sectionIndex}`}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-destructive mb-1">
                    {section.painPoint}
                  </h2>
                  <p className="text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pl-0 md:pl-16">
                {section.features.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <feature.icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-t from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('features.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('features.cta.subtitle')}
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 group">
              {t('features.cta.button')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
