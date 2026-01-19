import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  KeyRound, 
  LayoutDashboard, 
  FolderPlus, 
  Settings, 
  Link2, 
  Users, 
  Rocket,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

const OnboardingGuide = () => {
  const steps = [
    {
      step: 1,
      title: "Create Your Account",
      icon: UserPlus,
      description: "Register for a new SAAI account to get started",
      details: [
        "Navigate to the Sign Up page from the landing page",
        "Enter your email address and create a secure password",
        "Verify your email address (check spam folder if needed)",
        "Complete your profile with your name and role"
      ],
      tips: "Use your work email for team collaboration features",
      time: "2 minutes"
    },
    {
      step: 2,
      title: "Profile Approval",
      icon: Shield,
      description: "Wait for admin approval to access full platform features",
      details: [
        "New accounts require admin approval for security",
        "You'll receive an email notification once approved",
        "Admins typically review accounts within 24 hours",
        "Contact your organization admin if approval is delayed"
      ],
      tips: "Members are auto-assigned once approved - no pending state",
      time: "Up to 24 hours"
    },
    {
      step: 3,
      title: "Access Your Dashboard",
      icon: LayoutDashboard,
      description: "Once approved, explore your personalized dashboard",
      details: [
        "Log in with your credentials after approval",
        "The Getting Started page introduces Omair, your AI assistant",
        "Ask Omair questions about platform capabilities",
        "Choose to create a project or take a guided tour"
      ],
      tips: "Omair can guide you through any feature - just ask!",
      time: "5 minutes"
    },
    {
      step: 4,
      title: "Create Your First Project",
      icon: FolderPlus,
      description: "Set up a project to organize your agile work",
      details: [
        "Click 'Create Project' from the dashboard or command centre",
        "Enter project name and description",
        "Set target completion date (optional)",
        "Your project is now ready for team members and tasks"
      ],
      tips: "Start with one project to learn the workflow before scaling",
      time: "3 minutes"
    },
    {
      step: 5,
      title: "Configure Integrations",
      icon: Link2,
      description: "Connect your existing tools for seamless workflows",
      details: [
        "Navigate to Integrations from the sidebar",
        "Use the Integration Wizard for guided setup",
        "Connect GitHub for code activity tracking",
        "Connect Jira for existing backlog synchronization",
        "Connect Microsoft for calendar and email integration"
      ],
      tips: "Integrations are optional but enhance AI insights significantly",
      time: "5-10 minutes per integration"
    },
    {
      step: 6,
      title: "Invite Team Members",
      icon: Users,
      description: "Add your team to collaborate on projects",
      details: [
        "Go to Workspace Settings > People",
        "Click 'Add Team Member' and enter email addresses",
        "Assign appropriate roles (Admin, Member)",
        "Team members receive invitation emails automatically"
      ],
      tips: "Only allocated members can see project data for security",
      time: "2 minutes per member"
    },
    {
      step: 7,
      title: "Set Up Ceremonies",
      icon: Clock,
      description: "Configure your Scrum ceremonies for automation",
      details: [
        "Navigate to Ceremony Setup from sidebar",
        "Configure Daily Standup timing and frequency",
        "Set up Sprint Planning cadence",
        "Enable Sprint Review and Retrospective automation",
        "Add team member emails for calendar invites"
      ],
      tips: "Start with Daily Standup - it's the quickest win",
      time: "10 minutes"
    },
    {
      step: 8,
      title: "Customize Preferences",
      icon: Settings,
      description: "Personalize your SAAI experience",
      details: [
        "Go to Workspace Settings",
        "Set your preferred landing page (Dashboard, Projects, etc.)",
        "Configure notification preferences",
        "Enable dark/light mode based on preference",
        "Set language preference from 9 supported languages"
      ],
      tips: "Set Command Centre as landing page for project managers",
      time: "3 minutes"
    }
  ];

  const quickActions = [
    { label: "Create Account", path: "/auth", icon: UserPlus },
    { label: "View Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Projects", path: "/my-projects", icon: FolderPlus },
    { label: "Integrations", path: "/integrations", icon: Link2 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <BackButton />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Getting Started Guide
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to SAAI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your complete guide to getting onboarded and maximizing your agile workflow 
            with Spark-Agile AI Intelligence platform.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">8</div>
            <div className="text-sm text-muted-foreground">Setup Steps</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">~30</div>
            <div className="text-sm text-muted-foreground">Minutes Total</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">9</div>
            <div className="text-sm text-muted-foreground">Languages</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-sm text-muted-foreground">Integrations</div>
          </Card>
        </div>

        {/* Prerequisites */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Before You Begin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Work email address for account registration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Admin contact for account approval (new organizations)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Access credentials for integrations (GitHub, Jira, Microsoft) - optional</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Team member email addresses for invitations - optional</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-semibold text-foreground">Step-by-Step Onboarding</h2>
          
          {steps.map((step, index) => (
            <Card key={step.step} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                      {step.step}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        {step.title}
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {step.time}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ml-14">
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm">
                      <span className="font-medium text-primary">💡 Pro Tip:</span>{" "}
                      <span className="text-muted-foreground">{step.tips}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Jump right in with these shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.path} to={action.path}>
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                    <action.icon className="h-5 w-5" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>Additional resources to support your onboarding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/user-guide">
                <Button variant="outline" className="w-full justify-start">
                  📚 Full User Guide
                </Button>
              </Link>
              <Link to="/quick-start">
                <Button variant="outline" className="w-full justify-start">
                  🚀 Quick Start
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="w-full justify-start">
                  💬 Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OnboardingGuide;
