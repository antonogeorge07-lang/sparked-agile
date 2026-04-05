import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import type { ElementType } from "react";
import { 
  Clock, MessageSquareOff, BarChart3, Brain, Users, Target, 
  GitBranch, Calendar, Zap, ArrowRight, CheckCircle2, Kanban,
  Globe, Shield, Presentation, Bot, Workflow, FileText, Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { OptimizedImage } from "@/components/OptimizedImage";
import saaiLogo from "@/assets/saai-logo.png";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

interface PainPointSection {
  painPointKey: string;
  descriptionKey: string;
  icon: ElementType;
  features: {
    titleKey: string;
    descriptionKey: string;
    icon: ElementType;
  }[];
}

export default function Features() {
  const { t } = useTranslation();

  const painPointSections: PainPointSection[] = [
    {
      painPointKey: "features.painPoints.scatteredTools.title",
      descriptionKey: "features.painPoints.scatteredTools.description",
      icon: Kanban,
      features: [
        { titleKey: "features.painPoints.scatteredTools.features.nativeBoard.title", descriptionKey: "features.painPoints.scatteredTools.features.nativeBoard.description", icon: Kanban },
        { titleKey: "features.painPoints.scatteredTools.features.epicLifecycle.title", descriptionKey: "features.painPoints.scatteredTools.features.epicLifecycle.description", icon: GitBranch },
        { titleKey: "features.painPoints.scatteredTools.features.commandCentre.title", descriptionKey: "features.painPoints.scatteredTools.features.commandCentre.description", icon: Target }
      ]
    },
    {
      painPointKey: "features.painPoints.meetingChaos.title",
      descriptionKey: "features.painPoints.meetingChaos.description",
      icon: MessageSquareOff,
      features: [
        { titleKey: "features.painPoints.meetingChaos.features.aiStandup.title", descriptionKey: "features.painPoints.meetingChaos.features.aiStandup.description", icon: Brain },
        { titleKey: "features.painPoints.meetingChaos.features.ceremonies.title", descriptionKey: "features.painPoints.meetingChaos.features.ceremonies.description", icon: Calendar },
        { titleKey: "features.painPoints.meetingChaos.features.googleCalendar.title", descriptionKey: "features.painPoints.meetingChaos.features.googleCalendar.description", icon: Calendar }
      ]
    },
    {
      painPointKey: "features.painPoints.manualReporting.title",
      descriptionKey: "features.painPoints.manualReporting.description",
      icon: Clock,
      features: [
        { titleKey: "features.painPoints.manualReporting.features.executiveDigest.title", descriptionKey: "features.painPoints.manualReporting.features.executiveDigest.description", icon: FileText },
        { titleKey: "features.painPoints.manualReporting.features.advancedAnalytics.title", descriptionKey: "features.painPoints.manualReporting.features.advancedAnalytics.description", icon: BarChart3 },
        { titleKey: "features.painPoints.manualReporting.features.retroInsights.title", descriptionKey: "features.painPoints.manualReporting.features.retroInsights.description", icon: Sparkles }
      ]
    },
    {
      painPointKey: "features.painPoints.aiBoltOn.title",
      descriptionKey: "features.painPoints.aiBoltOn.description",
      icon: Bot,
      features: [
        { titleKey: "features.painPoints.aiBoltOn.features.aiCopilot.title", descriptionKey: "features.painPoints.aiBoltOn.features.aiCopilot.description", icon: Brain },
        { titleKey: "features.painPoints.aiBoltOn.features.backlogHealth.title", descriptionKey: "features.painPoints.aiBoltOn.features.backlogHealth.description", icon: Zap },
        { titleKey: "features.painPoints.stakeholderComms.features.teamCollab.title", descriptionKey: "features.painPoints.stakeholderComms.features.teamCollab.description", icon: Users }
      ]
    },
    {
      painPointKey: "features.painPoints.stakeholderComms.title",
      descriptionKey: "features.painPoints.stakeholderComms.description",
      icon: Users,
      features: [
        { titleKey: "features.painPoints.stakeholderComms.features.portal.title", descriptionKey: "features.painPoints.stakeholderComms.features.portal.description", icon: Presentation },
        { titleKey: "features.painPoints.stakeholderComms.features.approvals.title", descriptionKey: "features.painPoints.stakeholderComms.features.approvals.description", icon: CheckCircle2 },
        { titleKey: "features.painPoints.scalingAgile.features.i18n.title", descriptionKey: "features.painPoints.scalingAgile.features.i18n.description", icon: Globe }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Features - SAAI</title>
        <meta name="description" content="Explore SAAI features: AI sprint planning, epic management, flow metrics, and real-time collaboration." />
      </Helmet>
      {/* Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BackButton label={t('common.back', 'Back')} fallbackPath="/" variant="ghost" />
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
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button asChild size="sm">
                <Link to="/auth">{t("landing.getStarted", "Get Started")}</Link>
              </Button>
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
            <motion.section 
              key={sectionIndex} 
              className="scroll-mt-20" 
              id={`pain-${sectionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-destructive mb-1">
                    {t(section.painPointKey)}
                  </h2>
                  <p className="text-muted-foreground">
                    {t(section.descriptionKey)}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pl-0 md:pl-16">
                {section.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: featureIndex * 0.05 }}
                  >
                    <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <feature.icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <CardTitle className="text-base">{t(feature.titleKey)}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {t(feature.descriptionKey)}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
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
          <Button asChild size="lg" className="gap-2 group">
            <Link to="/auth">
              {t('features.cta.button')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
