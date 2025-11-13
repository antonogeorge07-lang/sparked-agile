import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  GitBranch, Target, Briefcase, Sparkles, Presentation, ListFilter,
  Calendar, Users, Activity, Network, ArrowRight, CheckCircle
} from "lucide-react";

const features = [
  {
    category: "Epic Management",
    icon: GitBranch,
    description: "Plan and track large initiatives across your organization",
    features: [
      { name: "Epics", path: "/epic-management", description: "Create and manage epics with dependencies and milestones" },
      { name: "Epic Portfolio", path: "/epic-portfolio", description: "View portfolio-level epic health, ROI, and progress" }
    ]
  },
  {
    category: "Agile Ceremonies",
    icon: Calendar,
    description: "AI-powered agile ceremonies to streamline your processes",
    features: [
      { name: "Command Centre", path: "/project-command-centre", description: "Central hub for project tasks and progress tracking" },
      { name: "Sprint Planning", path: "/sprint-planning-assistant", description: "AI-assisted sprint planning with JIRA integration" },
      { name: "Sprint Review", path: "/sprint-review-coordinator", description: "Coordinate demos and review completed work" },
      { name: "Backlog Refinement", path: "/backlog-refinement", description: "AI analysis of backlog health and prioritization" },
      { name: "Retrospective", path: "/retrospective", description: "AI-powered retro insights and action items" },
      { name: "Daily Standup", path: "/standup", description: "Quick standup summaries and blocker tracking" }
    ]
  },
  {
    category: "Analytics & Insights",
    icon: Activity,
    description: "Data-driven insights to improve team performance",
    features: [
      { name: "Dashboard", path: "/dashboard", description: "Sprint health, velocity trends, and key metrics" },
      { name: "Usage Analytics", path: "/usage-analytics", description: "Platform usage and feature adoption metrics" },
      { name: "Flow Metrics", path: "/flow-metrics", description: "Value stream and flow efficiency analysis" }
    ]
  },
  {
    category: "Setup & Integration",
    icon: Network,
    description: "Connect your tools and configure your workspace",
    features: [
      { name: "Integrations", path: "/integrations", description: "Connect JIRA, GitHub, and Outlook" },
      { name: "Ceremony Setup", path: "/ceremony-setup", description: "Schedule ceremonies and configure reminders" }
    ]
  }
];

const gettingStarted = [
  { step: 1, title: "Connect your tools", description: "Start by connecting JIRA, GitHub, or Outlook in Integrations", icon: Network },
  { step: 2, title: "Create a project", description: "Set up your first project in the Command Centre", icon: Briefcase },
  { step: 3, title: "Plan your sprint", description: "Use Sprint Planning Assistant to plan your first sprint", icon: Sparkles },
  { step: 4, title: "Track progress", description: "Monitor team velocity and progress in the Dashboard", icon: Activity },
];

export default function QuickStart() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to SAAI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered platform for Scaled Agile delivery. Let's get you started.
          </p>
        </div>

        {/* Getting Started Steps */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">🚀 Getting Started</CardTitle>
            <CardDescription>Follow these steps to set up your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {gettingStarted.map((item) => (
                <div key={item.step} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {item.step}
                    </div>
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Categories */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Platform Features</h2>
          
          {features.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.category}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.features.map((feature) => (
                    <div
                      key={feature.name}
                      className="group p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all cursor-pointer"
                      onClick={() => navigate(feature.path)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {feature.name}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into the most common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/integrations")} size="lg">
                <Network className="mr-2 h-4 w-4" />
                Setup Integrations
              </Button>
              <Button onClick={() => navigate("/sprint-planning-assistant")} size="lg" variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Plan Sprint
              </Button>
              <Button onClick={() => navigate("/dashboard")} size="lg" variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
              <Button onClick={() => navigate("/user-guide")} size="lg" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Full User Guide
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Check out the <button onClick={() => navigate("/user-guide")} className="text-primary hover:underline">User Guide</button> or explore features using the sidebar on the left.</p>
        </div>
      </main>
    </DashboardLayout>
  );
}
