import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Mail, Sparkles, Shield, Brain, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-6" />
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t("pages.faq.title")}</h1>
            <p className="text-xl text-muted-foreground">
              {t("pages.faq.subtitle")}
            </p>
          </div>

          {/* General Questions */}
          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                General Questions
              </CardTitle>
              <CardDescription>{t("pages.faq.learnBasics")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is SAAI?</AccordionTrigger>
                  <AccordionContent>
                    SAAI (Spark-Agile Active Intelligence) is your AI Chief of Staff - a Command Centre for Remote Teams. 
                    It is the "missing cognitive layer" that unifies context from all your tools (GitHub, Jira, Slack, Outlook) 
                    and delivers actionable insights in 5 minutes. No more tool chaos, no more missed updates.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the AI assistance work?</AccordionTrigger>
                  <AccordionContent>
                    SAAI uses a multi-agent AI system powered by Gemini:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Omair</strong>: Your support assistant for onboarding and platform help</li>
                      <li><strong>AI Co-Pilot</strong>: Generates user stories, estimates story points, detects blockers, and forecasts sprints</li>
                      <li><strong>Multi-Agent Debate</strong>: Specialist agents debate decisions from different perspectives to reach consensus</li>
                      <li><strong>Specialist Agents</strong>: Dedicated agents for retrospective insights, sprint planning, standup summaries, and GitHub digests</li>
                    </ul>
                    All agents share project context and persist recommendations for continuous learning.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Do I need to install anything?</AccordionTrigger>
                  <AccordionContent>
                    No installation required! SAAI is a cloud-based web application. Simply create an 
                    account and access it through your browser. We handle all infrastructure and updates automatically.
                    It works on mobile, tablet, and desktop with full iOS compatibility.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>What languages are supported?</AccordionTrigger>
                  <AccordionContent>
                    SAAI supports 9 languages with a fully localised interface: English, Spanish, French, German, 
                    Portuguese, Chinese, Japanese, Arabic (with RTL support), and Korean. You can switch languages anytime from the 
                    language selector in the navigation.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* {t("pages.faq.platformFeatures")} */}
          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Platform Features
                <Badge className="bg-tier-free text-white ml-2">Live</Badge>
              </CardTitle>
              <CardDescription>{t("pages.faq.currentCapabilities")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-5">
                  <AccordionTrigger>What's included in the Native PM Ecosystem?</AccordionTrigger>
                  <AccordionContent>
                    SAAI includes a complete project management system:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Kanban Boards</strong>: Visual task management with customisable columns and WIP limits</li>
                      <li><strong>Sprint Management</strong>: Plan, track, and review sprints with velocity tracking</li>
                      <li><strong>Backlog Tracking</strong>: Prioritise and manage your product backlog with AI health analysis</li>
                      <li><strong>Task Management</strong>: Create, assign, and track tasks with full activity history</li>
                      <li><strong>Epic Lifecycle</strong>: End-to-end epic management with ROI tracking, milestones, and closure workflows</li>
                    </ul>
                    This means SAAI works as a standalone tool. External integrations like Jira are optional.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>What can the AI Co-Pilot do?</AccordionTrigger>
                  <AccordionContent>
                    The AI Co-Pilot (powered by Gemini) provides four key actions:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Generate User Stories</strong>: Create well-structured user stories from requirements</li>
                      <li><strong>Estimate Story Points</strong>: AI-powered estimation based on historical data</li>
                      <li><strong>Detect Blockers</strong>: Proactively identify potential roadblocks</li>
                      <li><strong>Forecast Sprints</strong>: Predict sprint outcomes based on velocity and capacity</li>
                    </ul>
                    Additionally, specialist agents provide retrospective insights, standup summaries, sprint planning assistance, and executive digests.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>What integrations are supported?</AccordionTrigger>
                  <AccordionContent>
                    SAAI integrates with the tools your team already uses:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Jira</strong>: Sync backlog items, sprints, and issues</li>
                      <li><strong>GitHub</strong>: Track commits, PRs, and repository activity with automated digests</li>
                      <li><strong>Microsoft Outlook</strong>: Create calendar events for ceremonies</li>
                      <li><strong>Microsoft Teams</strong>: Send notifications and updates</li>
                      <li><strong>Slack</strong>: Team notifications and channel updates</li>
                    </ul>
                    Users manage their own Personal Access Tokens for secure, per-user integration.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-ceremonies">
                  <AccordionTrigger>What Sprint Ceremonies are available?</AccordionTrigger>
                  <AccordionContent>
                    SAAI supports a full suite of Agile ceremonies:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Daily Standups</strong>: Structured updates with AI-generated summaries</li>
                      <li><strong>Sprint Planning</strong>: AI-assisted capacity planning and story assignment</li>
                      <li><strong>Sprint Reviews</strong>: Track completed work with automated wrap-up reports</li>
                      <li><strong>Retrospectives</strong>: Collect feedback and generate AI-powered insights</li>
                      <li><strong>Backlog Refinement</strong>: AI health analysis and story estimation</li>
                    </ul>
                    All ceremonies can be scheduled with Outlook calendar integration and automated reminders.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-stakeholder">
                  <AccordionTrigger>What is the Stakeholder Portal?</AccordionTrigger>
                  <AccordionContent>
                    The Stakeholder Portal provides executives and stakeholders with:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Executive Dashboards</strong>: High-level project health and progress views</li>
                      <li><strong>Digest Subscriptions</strong>: Automated email digests on a schedule you choose</li>
                      <li><strong>Approval Workflows</strong>: Review and approve scope changes and epic closures</li>
                      <li><strong>Alert Configuration</strong>: Set up notifications for budget, timeline, and quality thresholds</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security & Access
              </CardTitle>
              <CardDescription>{t("pages.faq.enterpriseProtection")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-8">
                  <AccordionTrigger>How is my data protected?</AccordionTrigger>
                  <AccordionContent>
                    SAAI uses enterprise-grade security:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>196+ RLS Policies</strong>: Row-Level Security ensures complete data isolation</li>
                      <li><strong>AES-256-GCM Encryption</strong>: All sensitive data and integration tokens encrypted at rest</li>
                      <li><strong>GDPR Compliance</strong>: Full data privacy controls, consent management, and data export</li>
                      <li><strong>Immutable Audit Logs</strong>: All security-sensitive operations are logged with tamper-proof records</li>
                      <li><strong>Prompt Injection Protection</strong>: Role enforcement, character limits, and regex-based detection</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger>Who can see my project data?</AccordionTrigger>
                  <AccordionContent>
                    Only allocated project members can see project data. Key access rules:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>New users must register and be approved</li>
                      <li>Admin permission required for profile acceptance and validation</li>
                      <li>Only allocated project data is visible to each member</li>
                      <li>Role-based permissions control what actions users can perform</li>
                      <li>Integration tokens are encrypted and only accessible server-side</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10">
                  <AccordionTrigger>How do I sign up and get started?</AccordionTrigger>
                  <AccordionContent>
                    Click "Get Started" and create an account with your email. After email verification:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create your first workspace and project</li>
                      <li>Connect your integrations (GitHub, Jira, etc.)</li>
                      <li>Invite team members</li>
                      <li>Start managing your project with AI assistance</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="mb-6 border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Pricing & Limits
              </CardTitle>
              <CardDescription>{t("pages.faq.understandingCapabilities")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-14">
                  <AccordionTrigger>What's included in the free tier?</AccordionTrigger>
                  <AccordionContent>
                    The free tier includes generous limits for teams:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Up to 50 projects</li>
                      <li>1 workspace per project</li>
                      <li>Up to 15 team members per project</li>
                      <li>Full AI Co-Pilot access (story generation, estimation, blocker detection, forecasting)</li>
                      <li>All native PM features (Kanban, Sprints, Backlog, Epics)</li>
                      <li>All integrations (Jira, GitHub, Outlook, Teams, Slack)</li>
                      <li>Sprint ceremonies with AI summaries</li>
                      <li>Stakeholder portal and digest subscriptions</li>
                      <li>9-language support with RTL</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-15">
                  <AccordionTrigger>Are there API rate limits?</AccordionTrigger>
                  <AccordionContent>
                    Yes, API rate limits ensure fair usage:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Free tier</strong>: 100 requests/minute</li>
                      <li><strong>Pro tier (coming soon)</strong>: 1,000 requests/minute</li>
                      <li><strong>Enterprise (coming soon)</strong>: Unlimited</li>
                    </ul>
                    AI-specific endpoints have additional tiered limits to manage costs.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-primary/10 shadow-card">
            <CardHeader>
              <CardTitle>{t("pages.faq.stillHaveQuestions")}</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Get in touch with our support team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/contact")} className="gap-2">
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}