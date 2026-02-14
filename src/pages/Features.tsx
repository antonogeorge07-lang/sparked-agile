import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
      painPoint: "Scattered Tools, Zero Visibility",
      description: "Juggling Jira, Trello, spreadsheets, and Slack wastes time and kills context. SAAI gives you one native ecosystem.",
      icon: Kanban,
      features: [
        {
          title: "Native Kanban & Sprint Board",
          description: "Built-in Kanban, Sprint, and Backlog boards with drag-and-drop, WIP limits, and swimlanes - no external tools needed.",
          icon: Kanban
        },
        {
          title: "Epic Lifecycle Management",
          description: "Full epic tracking with Gantt charts, milestones, burndown analytics, ROI dashboards, and closure workflows.",
          icon: GitBranch
        },
        {
          title: "Project Command Centre",
          description: "A unified dashboard with real-time task stages, risk registers, lessons learned, and AI-powered project insights.",
          icon: Target
        }
      ]
    },
    {
      painPoint: "Meeting Chaos & Wasted Ceremonies",
      description: "Standups that drag on, retros that go nowhere, and sprint reviews nobody prepares for. SAAI automates the busywork.",
      icon: MessageSquareOff,
      features: [
        {
          title: "AI Standup Summaries",
          description: "Gemini-powered summaries that capture blockers, progress, and action items automatically from async updates.",
          icon: Brain
        },
        {
          title: "Sprint Ceremonies Suite",
          description: "Dedicated tools for Sprint Planning, Review Coordination, and Retrospective Insights - all AI-assisted.",
          icon: Calendar
        },
        {
          title: "Google Calendar Sync",
          description: "Automatically push ceremony schedules to Google Calendar with attendee management and smart reminders.",
          icon: Calendar
        }
      ]
    },
    {
      painPoint: "Manual Reporting & Status Updates",
      description: "Hours spent compiling reports that are outdated by the time they're sent. SAAI generates them in seconds.",
      icon: Clock,
      features: [
        {
          title: "Executive Digest",
          description: "AI-generated daily and weekly digests summarising sprint health, risks, wins, and recommendations - delivered automatically.",
          icon: FileText
        },
        {
          title: "Advanced Analytics",
          description: "Velocity trends, commitment delivery charts, workflow execution metrics, and flow analytics - all auto-calculated.",
          icon: BarChart3
        },
        {
          title: "Retrospective Insights",
          description: "AI analyses retro feedback to surface patterns, generate action items, and track improvement over time.",
          icon: Sparkles
        }
      ]
    },
    {
      painPoint: "AI is a Bolt-on, Not Built-in",
      description: "Most PM tools treat AI as an afterthought. SAAI's AI Co-Pilot is woven into every workflow.",
      icon: Bot,
      features: [
        {
          title: "AI Co-Pilot (Gemini-powered)",
          description: "User story generation, point estimation, blocker detection, and sprint forecasting - directly inside your board.",
          icon: Brain
        },
        {
          title: "Multi-Agent AI Debate",
          description: "Multiple AI agents debate trade-offs on sprint scope, technical decisions, and risk mitigation - then reach consensus.",
          icon: Sparkles
        },
        {
          title: "Backlog Health Analysis",
          description: "AI scans your backlog for stale items, missing acceptance criteria, and priority misalignment.",
          icon: Zap
        }
      ]
    },
    {
      painPoint: "Stakeholders Left in the Dark",
      description: "Executives asking 'where are we?' and teams scrambling to create decks. SAAI keeps everyone informed automatically.",
      icon: Users,
      features: [
        {
          title: "Stakeholder Portal",
          description: "A dedicated view for stakeholders with progress dashboards, approval workflows, and digest subscriptions.",
          icon: Presentation
        },
        {
          title: "Approval Workflows",
          description: "Structured approval requests with priority levels, due dates, and email notifications to keep decisions moving.",
          icon: CheckCircle2
        },
        {
          title: "Team Collaboration",
          description: "Real-time presence indicators, team member management, and role-based access across all project workspaces.",
          icon: Users
        }
      ]
    },
    {
      painPoint: "Scaling Agile is Painful",
      description: "Scaling from one team to an enterprise programme needs more than sticky notes. SAAI supports SAFe out of the box.",
      icon: Workflow,
      features: [
        {
          title: "SAFe Workflows",
          description: "Value streams, Agile Release Trains, and Program Increment planning - built for enterprise-scale agility.",
          icon: Workflow
        },
        {
          title: "9-Language Support",
          description: "Full localisation across English, French, German, Spanish, Portuguese, Arabic, Japanese, Korean, and Chinese.",
          icon: Globe
        },
        {
          title: "Enterprise-Grade Security",
          description: "196+ RLS policies, AES-256 token encryption, GDPR compliance, and comprehensive audit logging.",
          icon: Shield
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
            Every Feature Solves a Real Problem
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SAAI is built around the pain points that slow teams down. Here's how every capability maps to a problem you're facing today.
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
                    {section.painPoint}
                  </h2>
                  <p className="text-muted-foreground">
                    {section.description}
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
                          <CardTitle className="text-base">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {feature.description}
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
            Ready to Transform Your Delivery?
          </h2>
          <p className="text-muted-foreground mb-6">
            All features included. No credit card. No API keys. Just sign in and start.
          </p>
          <Button asChild size="lg" className="gap-2 group">
            <Link to="/auth">
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
