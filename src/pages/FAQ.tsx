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
import { HelpCircle, Mail } from "lucide-react";
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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>General Questions</CardTitle>
              <CardDescription>Learn about SAAI basics</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is SAAI?</AccordionTrigger>
                  <AccordionContent>
                    SAAI is an AI-powered platform that helps agile teams optimize their Scrum ceremonies,
                    track progress, and improve collaboration. It integrates with tools like JIRA and GitHub to provide 
                    intelligent insights and automation for your agile workflows.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the AI assistance work?</AccordionTrigger>
                  <AccordionContent>
                    Our AI analyzes your team's data, including sprint velocity, backlog health, and ceremony outcomes. 
                    It provides actionable recommendations, generates summaries, identifies blockers, and helps facilitate 
                    more effective agile ceremonies.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Do I need to install anything?</AccordionTrigger>
                  <AccordionContent>
                    No installation required! SAAI is a cloud-based web application. Simply create an 
                    account and access it through your browser. We handle all infrastructure and updates automatically.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account & Access</CardTitle>
              <CardDescription>Managing your account and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I sign up?</AccordionTrigger>
                  <AccordionContent>
                    Click the "Sign Up" button, enter your email and create a password. You'll be automatically 
                    signed in and can immediately start creating projects and collaborating with your team.
                    you can immediately start creating and managing projects.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I get started with my account?</AccordionTrigger>
                  <AccordionContent>
                    After signing up, you can immediately access all platform features. Start by creating your first workspace
                    and project, explore the documentation, and familiarize yourself with the available tools and integrations.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I be part of multiple projects?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can be assigned to multiple projects. Your project limit depends on your subscription tier. 
                    Each project has its own members, workspaces, and data that only allocated members can access.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Features & Integrations</CardTitle>
              <CardDescription>Understanding platform capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-7">
                  <AccordionTrigger>What integrations are supported?</AccordionTrigger>
                  <AccordionContent>
                    We currently support JIRA (for backlog management), GitHub (for code commits), Microsoft Outlook 
                    (for calendar events), and Microsoft Teams (for notifications). More integrations are coming soon!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>How do I set up ceremony reminders?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to your project workspace, go to Ceremony Setup, and configure the ceremonies you want 
                    (Daily Standup, Sprint Planning, etc.). You can schedule automated reminders via email or Microsoft 
                    Teams, and even create Outlook calendar events automatically.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger>Can the AI generate sprint planning suggestions?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Our Sprint Planning Assistant analyzes your backlog, team velocity, and capacity to suggest 
                    optimal sprint commitments. It helps you balance workload and identify potential risks before 
                    the sprint begins.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pricing & Subscriptions</CardTitle>
              <CardDescription>Understanding our pricing tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-10">
                  <AccordionTrigger>What's included in the Free tier?</AccordionTrigger>
                  <AccordionContent>
                    The Free tier includes up to 50 projects, 1 workspace per project, 5 team members, basic AI features, 
                    and email support. Perfect for small teams getting started with AI-powered agile management.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-11">
                  <AccordionTrigger>How do I upgrade my subscription?</AccordionTrigger>
                  <AccordionContent>
                    Go to your account settings, select "Subscription", and choose the tier that fits your needs. 
                    Upgrades are effective immediately, and you'll be charged on a monthly or annual basis depending 
                    on your selection.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-12">
                  <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can cancel your subscription at any time. Your access continues until the end of your 
                    current billing period. No cancellation fees or long-term commitments required.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

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
