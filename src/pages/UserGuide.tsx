import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { 
import { Helmet } from "react-helmet-async";
  BookOpen, 
  Users, 
  Target, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Zap,
  GitBranch,
  Bell,
  Shield,
  Workflow,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Activity
} from "lucide-react";

export default function UserGuide() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>User Guide - SAAI</title>
        <meta name="description" content="Complete guide to using SAAI for agile project management and team collaboration." />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-5xl mx-auto">
          <BackButton className="mb-6" />
          
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold">May I Help You</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Your complete guide to mastering SAAI
            </p>
            <Badge variant="outline" className="mt-4">Good to Know</Badge>
          </div>

          {/* Getting Started */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Getting Started</CardTitle>
              </div>
              <CardDescription>Essential first steps for new users</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Account Setup & Approval</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Step 1:</strong> Sign up with your email and create a secure password</p>
                      <p><strong>Step 2:</strong> You'll be automatically signed in and can explore the platform immediately</p>
                      <p><strong>Step 3:</strong> While waiting for admin approval, you can:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Explore demo features and sample data</li>
                        <li>Review comprehensive documentation</li>
                        <li>Learn about all platform features</li>
                        <li>Take the interactive onboarding tour</li>
                      </ul>
                      <p><strong>Step 4:</strong> Once approved by admin (you'll receive an email), you can:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Access real project data</li>
                        <li>Request project allocation from your admin</li>
                        <li>Collaborate with your team</li>
                        <li>Use all platform features</li>
                      </ul>
                      <p className="text-muted-foreground italic">
                        💡 This approval process protects your organization's data while letting you get started right away
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Navigating the Dashboard</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Navigation Bar:</strong> Access all features from the top menu</p>
                      <p><strong>Home:</strong> Quick overview and recent activities</p>
                      <p><strong>Dashboard:</strong> Project metrics and progress tracking</p>
                      <p><strong>Sprint AI:</strong> AI-powered sprint planning assistance</p>
                      <p><strong>Review:</strong> Sprint review coordination</p>
                      <p><strong>Backlog:</strong> Backlog refinement tools</p>
                      <p><strong>Analytics:</strong> Usage and performance insights</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Setting Up Your First Project</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Method 1: Project Command Centre (Recommended)</strong></p>
                      <p>• Navigate to <strong>Command Centre</strong> in the main navigation</p>
                      <p>• Click <strong>"New Project"</strong> button to instantly create a project</p>
                      <p>• Enter project name, description, and target completion date</p>
                      <p>• Start managing tasks immediately with PMI methodology</p>
                      
                      <p className="pt-3"><strong>Method 2: Project Workspace (Full Setup)</strong></p>
                      <p>• Navigate to Project Workspace for comprehensive setup</p>
                      <p>• Configure sprint duration and team information</p>
                      <p>• Connect JIRA, GitHub, and Microsoft services</p>
                      <p>• Set up automated Scrum ceremonies</p>
                      
                      <p className="text-muted-foreground italic pt-2">
                        💡 Use Command Centre for quick project setup, or Project Workspace for full Agile integration
                      </p>
                      <p className="text-muted-foreground italic">
                        💡 Admin permission is required for profile acceptance and validation
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Core Features */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Core Features</CardTitle>
              </div>
              <CardDescription>Master the essential platform capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Daily Standup
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Share daily updates and identify blockers</p>
                      <p><strong>How to Use:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Navigate to Standup from the menu</li>
                        <li>Enter what you did yesterday, today's plan, and any blockers</li>
                        <li>AI analyzes all updates and generates team summary</li>
                        <li>Review AI insights on blockers and action items</li>
                      </ul>
                      <p className="text-muted-foreground italic">
                        💡 Best practice: Keep updates concise and specific
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sprint Planning Assistant
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> AI-powered sprint planning recommendations</p>
                      <p><strong>Features:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Analyzes backlog health and team velocity</li>
                        <li>Suggests optimal story point commitments</li>
                        <li>Identifies risks and dependencies</li>
                        <li>Balances workload across team members</li>
                      </ul>
                      <p><strong>Integration:</strong> Connect JIRA to pull backlog automatically</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Sprint Review Coordinator
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Streamline sprint review meetings</p>
                      <p><strong>Capabilities:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Auto-generates demo checklist from completed work</li>
                        <li>Creates Outlook calendar invites</li>
                        <li>Sends automated reminders via email/Teams</li>
                        <li>Records meeting minutes and action items</li>
                        <li>AI-powered wrap-up summaries</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Retrospective
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Capture team feedback and improve processes</p>
                      <p><strong>Process:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>What went well: Celebrate successes</li>
                        <li>What could improve: Identify pain points</li>
                        <li>Action items: Define concrete next steps</li>
                        <li>AI generates insights and improvement suggestions</li>
                      </ul>
                      <p className="text-muted-foreground italic">
                        💡 Schedule regular retrospectives for continuous improvement
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Backlog Refinement
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Keep your backlog healthy and ready</p>
                      <p><strong>Features:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>AI analyzes backlog health metrics</li>
                        <li>Identifies incomplete or unclear stories</li>
                        <li>Suggests story splitting and prioritization</li>
                        <li>Tracks definition of ready compliance</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8b">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Project Command Centre - Create & Manage Projects
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Your primary tool for creating new projects and managing them with PMI methodology</p>
                      
                      <p><strong>Creating a New Project:</strong></p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Click <strong>"Command Centre"</strong> in the main navigation</li>
                        <li>Click the <strong>"New Project"</strong> button in the top-right</li>
                        <li>Enter project name (required), description, and target completion date</li>
                        <li>Click <strong>"Create Project"</strong> - your project is ready instantly!</li>
                        <li>Add team members using the Project Member Manager</li>
                        <li>Start creating and organizing tasks across PMI stages</li>
                      </ol>
                      
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>PMI Task Stages:</strong> Manage tasks through Initiation, Planning, Execution, Monitoring & Control, and Closure phases</li>
                        <li><strong>Kanban Board:</strong> Drag-and-drop tasks between project stages</li>
                        <li><strong>AI Insights:</strong> Get intelligent recommendations for your projects</li>
                        <li><strong>Risk Register:</strong> Track and mitigate project risks</li>
                        <li><strong>Lessons Learned:</strong> Document and share project knowledge</li>
                        <li><strong>Team Management:</strong> Assign members and manage project access</li>
                        <li><strong>Real-time Collaboration:</strong> See who's working on what, live</li>
                      </ul>

                      <p className="text-primary font-semibold pt-2">✨ This is the fastest way to create and manage projects on SAAI!</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <CardTitle>Integrations</CardTitle>
              </div>
              <CardDescription>Connect your favorite tools</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-9">
                  <AccordionTrigger>JIRA Integration</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Setup Steps:</strong></p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Integrations page</li>
                        <li>Select your project</li>
                        <li>Click "Connect JIRA"</li>
                        <li>Enter JIRA domain (e.g., company.atlassian.net)</li>
                        <li>Provide JIRA email and API token</li>
                        <li>Enter Board ID</li>
                        <li>Test connection and save</li>
                      </ol>
                      <p><strong>Features:</strong> Auto-sync backlog, pull completed work, track story points</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10">
                  <AccordionTrigger>GitHub Integration</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Setup Steps:</strong></p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Go to Integrations page</li>
                        <li>Select your project</li>
                        <li>Click "Connect GitHub"</li>
                        <li>Enter repository owner and name</li>
                        <li>Provide Personal Access Token</li>
                        <li>Test connection and save</li>
                      </ol>
                      <p><strong>Features:</strong> Track commits, monitor code activity, link PRs to stories</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-11">
                  <AccordionTrigger>Microsoft Services (Outlook & Teams)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Setup:</strong> Configure during Project Workspace initialization</p>
                      <p><strong>Outlook Features:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Auto-create calendar events for ceremonies</li>
                        <li>Send meeting invites to team members</li>
                        <li>Schedule recurring events</li>
                      </ul>
                      <p><strong>Teams Features:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Create dedicated project channels</li>
                        <li>Send automated reminders</li>
                        <li>Post ceremony summaries</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Ceremony Automation */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Ceremony Automation</CardTitle>
              </div>
              <CardDescription>Set up automated Scrum ceremonies</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-12">
                  <AccordionTrigger>Configure Ceremonies</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Available Ceremonies:</strong></p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Daily Scrum:</strong> 15 min, daily, 9:00 AM</li>
                        <li><strong>Sprint Planning:</strong> 4 hours, every 2 weeks, Monday 9:00 AM</li>
                        <li><strong>Sprint Review:</strong> 2 hours, every 2 weeks, Friday 2:00 PM</li>
                        <li><strong>Sprint Retrospective:</strong> 1.5 hours, every 2 weeks, Friday 4:00 PM</li>
                        <li><strong>Backlog Refinement:</strong> 1 hour, weekly, Wednesday 2:00 PM</li>
                      </ul>
                      <p><strong>Setup:</strong> Navigate to Ceremony Setup to enable/customize each ceremony</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-13">
                  <AccordionTrigger>Reminder Management</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Options:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Send one-time reminders for upcoming ceremonies</li>
                        <li>Schedule recurring reminders (daily, weekly, custom)</li>
                        <li>Choose delivery method: Email or Microsoft Teams</li>
                        <li>Customize reminder timing (e.g., 30 minutes before)</li>
                      </ul>
                      <p className="text-muted-foreground italic">
                        💡 Access Reminder Management from your project workspace
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Analytics & Workflows */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                <CardTitle>Advanced Features</CardTitle>
              </div>
              <CardDescription>Power user capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-14">
                  <AccordionTrigger>Usage Analytics</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Track:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Team participation rates</li>
                        <li>Ceremony attendance</li>
                        <li>Feature usage patterns</li>
                        <li>Sprint velocity trends</li>
                      </ul>
                      <p><strong>Insights:</strong> Use data to optimize team processes and identify areas for improvement</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-15">
                  <AccordionTrigger>AI Workflows</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Available Workflows:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Standup Analysis:</strong> Parse daily updates and extract insights</li>
                        <li><strong>Sprint Extraction:</strong> Analyze sprint completion data</li>
                        <li><strong>Retro Insights:</strong> Generate improvement recommendations</li>
                      </ul>
                      <p><strong>Usage:</strong> Navigate to Workflows, select type, input data, execute</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-16">
                  <AccordionTrigger>Video Script Generator</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Create professional sprint demo video scripts</p>
                      <p><strong>How to Use:</strong></p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Navigate to Video Script Generator</li>
                        <li>Describe your demo content (features, achievements, highlights)</li>
                        <li>AI generates structured video script</li>
                        <li>Review and customize as needed</li>
                      </ol>
                      <p className="text-muted-foreground italic">
                        💡 Perfect for stakeholder presentations and demo recordings
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Team & Project Management</CardTitle>
              </div>
              <CardDescription>Manage teams and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-17">
                  <AccordionTrigger>Project Members</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Admin Functions:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Approve new user registrations</li>
                        <li>Assign users to projects</li>
                        <li>Manage team member permissions</li>
                        <li>Remove users from projects</li>
                      </ul>
                      <p className="text-muted-foreground italic">
                        🔒 Only allocated members can see project data
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-18">
                  <AccordionTrigger>Subscription & Limits</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Free Tier:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Up to 50 projects</li>
                        <li>1 workspace per project</li>
                        <li>15 team members</li>
                        <li>Basic AI features</li>
                      </ul>
                      <p><strong>Upgrade:</strong> Go to Subscription page for higher limits and advanced features</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Security & Best Practices */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security & Best Practices</CardTitle>
              </div>
              <CardDescription>Keep your data safe and workflows efficient</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-19">
                  <AccordionTrigger>Security Guidelines</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Best Practices:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use strong, unique passwords</li>
                        <li>Never share API tokens</li>
                        <li>Regularly review team member access</li>
                        <li>Ensure only authorized users are project members</li>
                        <li>Keep integration credentials updated</li>
                      </ul>
                      <p><strong>Data Protection:</strong> All data is encrypted and access-controlled via RLS policies</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-19b">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Security Incidents Dashboard
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Purpose:</strong> Monitor, track, and resolve security incidents with AI assistance</p>
                      <p><strong>Admin Access:</strong> Navigate to Admin → Security Incidents (admin privileges required)</p>
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Real-time Monitoring:</strong> Live updates on active security incidents</li>
                        <li><strong>Incident Types:</strong> Unauthorized access, data breach, malware, DDoS, phishing, insider threat, and more</li>
                        <li><strong>Severity Levels:</strong> Critical, high, medium, low classification</li>
                        <li><strong>Status Tracking:</strong> Detected, investigating, contained, resolved</li>
                        <li><strong>AI Bot Assignment:</strong> Assign specialized bots to investigate and resolve incidents automatically</li>
                        <li><strong>Evidence Collection:</strong> Document and track incident evidence</li>
                        <li><strong>Root Cause Analysis:</strong> AI-powered analysis and lessons learned</li>
                      </ul>
                      <p><strong>Bot Capabilities:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Investigation Bot:</strong> Analyzes incident details and gathers evidence</li>
                        <li><strong>Containment Bot:</strong> Implements immediate security measures</li>
                        <li><strong>Remediation Bot:</strong> Executes resolution steps and patches vulnerabilities</li>
                        <li><strong>Documentation Bot:</strong> Creates detailed incident reports and compliance logs</li>
                      </ul>
                      <p><strong>How to Use:</strong></p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Access Admin Dashboard → Security Incidents</li>
                        <li>View all incidents with real-time status updates</li>
                        <li>Filter by severity, status, or incident type</li>
                        <li>Click an incident to view full details</li>
                        <li>Assign appropriate bot for automated resolution</li>
                        <li>Monitor bot progress and review actions taken</li>
                        <li>Document lessons learned for future prevention</li>
                      </ol>
                      <p className="text-muted-foreground italic">
                        🤖 AI bots work 24/7 to investigate and resolve incidents, reducing response time and improving security posture
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-20">
                  <AccordionTrigger>Platform Best Practices</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p><strong>Tips for Success:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>✅ Keep standup updates concise and specific</li>
                        <li>✅ Review AI insights regularly to improve processes</li>
                        <li>✅ Use integrations to automate data collection</li>
                        <li>✅ Schedule ceremonies consistently</li>
                        <li>✅ Complete profile information for better collaboration</li>
                        <li>✅ Leverage analytics to identify improvement areas</li>
                        <li>✅ Engage with retrospective action items</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
