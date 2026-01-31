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
import { HelpCircle, Mail, Clock, Sparkles, Shield, Brain, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-6" />
          <div className="text-center mb-12">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about SAAI
            </p>
          </div>

          {/* General Questions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                General Questions
              </CardTitle>
              <CardDescription>Learn about SAAI basics</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is SAAI?</AccordionTrigger>
                  <AccordionContent>
                    SAAI (Spark-Agile Active Intelligence) is your AI Chief of Staff, a Command Center for Remote Teams. 
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
                      <li><strong>Specialist Agents</strong>: Dedicated agents for retrospective insights, sprint planning, and GitHub digests</li>
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
                    SAAI supports 9 languages with a fully localized interface: English, Spanish, French, German, 
                    Portuguese, Chinese, Japanese, Arabic, and Korean. You can switch languages anytime from the 
                    language selector in the navigation.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Platform Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Platform Features
                <Badge className="bg-tier-free text-white ml-2">Available Now</Badge>
              </CardTitle>
              <CardDescription>Current capabilities and architecture</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-5">
                  <AccordionTrigger>What's included in the Native PM Ecosystem?</AccordionTrigger>
                  <AccordionContent>
                    SAAI includes a complete project management system:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Kanban Boards</strong>: Visual task management with customizable columns</li>
                      <li><strong>Sprint Management</strong>: Plan, track, and review sprints</li>
                      <li><strong>Backlog Tracking</strong>: Prioritize and manage your product backlog</li>
                      <li><strong>Task Management</strong>: Create, assign, and track tasks with full history</li>
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>What integrations are supported?</AccordionTrigger>
                  <AccordionContent>
                    SAAI integrates with the tools your team already uses:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Jira</strong>: Sync backlog items, sprints, and issues</li>
                      <li><strong>GitHub</strong>: Track commits, PRs, and repository activity</li>
                      <li><strong>Microsoft Outlook</strong>: Create calendar events for ceremonies</li>
                      <li><strong>Microsoft Teams</strong>: Send notifications and updates</li>
                      <li><strong>Slack</strong>: Team notifications and channel updates</li>
                    </ul>
                    Users manage their own Personal Access Tokens for secure, per-user integration.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security & Access
              </CardTitle>
              <CardDescription>Enterprise-grade protection for your data</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-8">
                  <AccordionTrigger>How is my data protected?</AccordionTrigger>
                  <AccordionContent>
                    SAAI uses enterprise-grade security:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>196+ RLS Policies</strong>: Row-Level Security ensures data isolation</li>
                      <li><strong>AES-256-GCM Encryption</strong>: All sensitive data encrypted at rest</li>
                      <li><strong>GDPR Compliance</strong>: Full data privacy controls and consent management</li>
                      <li><strong>Prompt Injection Protection</strong>: Role enforcement, character limits, and regex detection</li>
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

          {/* Coming Soon */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Coming Soon
                <Badge variant="outline" className="ml-2 gap-1">
                  <Clock className="h-3 w-3" />
                  30 Days
                </Badge>
              </CardTitle>
              <CardDescription>Features launching in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-11">
                  <AccordionTrigger>What features are coming next?</AccordionTrigger>
                  <AccordionContent>
                    We're launching these features in the next 30 days:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Sprint Ceremonies</strong>: Full standup, retrospective, and planning workflows</li>
                      <li><strong>AI Standup Summaries</strong>: Automated daily updates from your team</li>
                      <li><strong>Epic Management</strong>: ROI tracking, dependency visualization, and milestone management</li>
                      <li><strong>Real-time Collaboration</strong>: Live presence indicators and co-editing</li>
                      <li><strong>Advanced Flow Metrics</strong>: Velocity trends, cycle time analytics, and throughput tracking</li>
                      <li><strong>Stakeholder Portal</strong>: Executive dashboards and digest subscriptions</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-12">
                  <AccordionTrigger>Will these features be free?</AccordionTrigger>
                  <AccordionContent>
                    We're currently focused on building and refining features. All currently available features 
                    are free to use. Pricing details for advanced features will be announced closer to launch. 
                    Our goal is to keep core functionality accessible to all teams.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-13">
                  <AccordionTrigger>How can I get notified when new features launch?</AccordionTrigger>
                  <AccordionContent>
                    Sign up for an account to receive updates about new features. You can also visit our 
                    landing page and subscribe to our newsletter. We'll notify you as soon as new capabilities 
                    are available.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Pricing & Limits
              </CardTitle>
              <CardDescription>Understanding current capabilities</CardDescription>
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
                      <li>All native PM features (Kanban, Sprints, Backlog)</li>
                      <li>All integrations (Jira, GitHub, Outlook, Teams, Slack)</li>
                      <li>9-language support</li>
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
          <Card>
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
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
