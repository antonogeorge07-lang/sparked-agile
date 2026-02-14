import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Target, Users, BarChart3, GitBranch, 
  Calendar, Presentation, TrendingUp, Workflow, MessageSquare,
  CheckSquare, FileText, Shield, Languages, Briefcase, Play,
  BookOpen, ArrowRight, Sparkles, ListFilter
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "planning" | "execution" | "insights" | "collaboration" | "advanced";
  path: string;
  demoSteps: string[];
  benefits: string[];
}

const features: Feature[] = [
  {
    id: "dashboard",
    title: "Project Dashboard",
    description: "Real-time overview of your project metrics, velocity, and sprint progress",
    icon: LayoutDashboard,
    category: "insights",
    path: "/dashboard",
    demoSteps: [
      "View your team's velocity trends over multiple sprints",
      "Monitor current sprint progress and completion percentage",
      "Track active impediments and blockers",
      "Review action items and their status",
      "Export reports to PowerPoint for stakeholder updates"
    ],
    benefits: [
      "Make data-driven decisions with real-time metrics",
      "Identify bottlenecks before they become problems",
      "Keep stakeholders informed with automated reports"
    ]
  },
  {
    id: "sprint-planning",
    title: "Sprint Planning Assistant",
    description: "AI-powered sprint planning with JIRA integration and automated meeting coordination",
    icon: Target,
    category: "planning",
    path: "/sprint-planning",
    demoSteps: [
      "Configure your sprint number and team size",
      "Connect to JIRA to fetch prioritized backlog items",
      "Let AI generate sprint goals and story point estimates",
      "Review and customize the AI-generated agenda",
      "Create Outlook calendar invites with Teams meeting links",
      "Record meeting minutes and update JIRA automatically"
    ],
    benefits: [
      "Save hours on sprint planning preparation",
      "Ensure consistent sprint goal quality",
      "Automatically sync decisions back to JIRA"
    ]
  },
  {
    id: "standup",
    title: "Daily Standup",
    description: "Streamlined daily standup updates with AI-powered summaries",
    icon: Users,
    category: "execution",
    path: "/standup",
    demoSteps: [
      "Team members submit their daily updates",
      "Share what was done yesterday",
      "Outline today's planned work",
      "Flag any blockers or impediments",
      "AI generates intelligent summaries and insights",
      "Export standup notes for team reference"
    ],
    benefits: [
      "Keep standups focused and time-boxed",
      "Track patterns in blockers and progress",
      "Never lose important standup information"
    ]
  },
  {
    id: "retrospective",
    title: "Sprint Retrospective",
    description: "Collaborative retrospective sessions with AI insights and action tracking",
    icon: MessageSquare,
    category: "insights",
    path: "/retrospective",
    demoSteps: [
      "Collect feedback on what went well",
      "Identify areas for improvement",
      "Discuss what to start, stop, or continue",
      "AI analyzes feedback patterns and trends",
      "Create actionable items with owners",
      "Track improvement over time"
    ],
    benefits: [
      "Foster continuous team improvement",
      "Get AI-powered insights on team dynamics",
      "Ensure retrospective actions are tracked"
    ]
  },
  {
    id: "backlog",
    title: "Backlog Refinement",
    description: "Prioritize and refine your product backlog with AI assistance",
    icon: ListFilter,
    category: "planning",
    path: "/backlog-refinement",
    demoSteps: [
      "Import backlog items from JIRA",
      "Review and estimate story points",
      "Prioritize using value vs effort matrix",
      "Get AI suggestions for story refinement",
      "Break down epics into user stories",
      "Sync updated items back to JIRA"
    ],
    benefits: [
      "Maintain a healthy, prioritized backlog",
      "Reduce estimation variance",
      "Improve story quality with AI assistance"
    ]
  },
  {
    id: "sprint-review",
    title: "Sprint Review Coordinator",
    description: "Prepare and coordinate sprint review sessions with stakeholder management",
    icon: Presentation,
    category: "execution",
    path: "/sprint-review",
    demoSteps: [
      "Generate demo checklist from completed work",
      "Fetch completed items from JIRA",
      "Create review agenda and talking points",
      "Schedule review meeting with stakeholders",
      "Record demo feedback and decisions",
      "Share review summary via email"
    ],
    benefits: [
      "Deliver polished sprint reviews every time",
      "Keep stakeholders engaged and informed",
      "Track feedback for future planning"
    ]
  },
  {
    id: "command-centre",
    title: "Project Command Centre",
    description: "Centralized project management with Kanban boards and AI insights",
    icon: BarChart3,
    category: "execution",
    path: "/project-command-centre",
    demoSteps: [
      "View all projects in a unified dashboard",
      "Drag and drop tasks across stages",
      "Track project health and risks",
      "Review AI-generated insights",
      "Manage team members and assignments",
      "Monitor lessons learned"
    ],
    benefits: [
      "Get a bird's-eye view of all projects",
      "Quickly identify at-risk projects",
      "Learn from past successes and failures"
    ]
  },
  {
    id: "workflows",
    title: "Workflow Automation",
    description: "Automate repetitive tasks and create custom workflows",
    icon: Workflow,
    category: "advanced",
    path: "/workflows",
    demoSteps: [
      "Browse pre-built workflow templates",
      "Customize workflows for your team",
      "Set up triggers and actions",
      "Monitor workflow execution",
      "View automation metrics and savings"
    ],
    benefits: [
      "Eliminate manual, repetitive work",
      "Ensure consistency in processes",
      "Free up time for high-value activities"
    ]
  },
  {
    id: "market-intelligence",
    title: "Market Intelligence",
    description: "AI-powered market research and competitive analysis",
    icon: TrendingUp,
    category: "insights",
    path: "/market-intelligence",
    demoSteps: [
      "Enter your product or market query",
      "AI conducts comprehensive research",
      "Review competitor analysis",
      "Identify market trends and opportunities",
      "Generate reports for stakeholders"
    ],
    benefits: [
      "Make informed product decisions",
      "Stay ahead of competitors",
      "Validate ideas with market data"
    ]
  },
  {
    id: "polylinq",
    title: "PolyLinQ - Multilingual AI",
    description: "Translate and localize content across 100+ languages",
    icon: Languages,
    category: "advanced",
    path: "/polylinq",
    demoSteps: [
      "Upload or paste content to translate",
      "Select target language(s)",
      "AI translates with cultural context",
      "Review and refine translations",
      "Export in various formats"
    ],
    benefits: [
      "Reach global markets faster",
      "Maintain brand voice across languages",
      "Reduce translation costs significantly"
    ]
  }
];

const categories = {
  planning: { label: "Planning", icon: Target },
  execution: { label: "Execution", icon: CheckSquare },
  insights: { label: "Insights", icon: BarChart3 },
  collaboration: { label: "Collaboration", icon: Users },
  advanced: { label: "Advanced", icon: Sparkles }
};

export default function FeatureDemo() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredFeatures = selectedCategory === "all" 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <BackButton className="mb-4" />
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Interactive Feature Demos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Learn How to Use SAAI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our powerful features with interactive walkthroughs and see how SAAI can transform your agile workflow
          </p>
        </div>

        {/* Category Filter */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="w-full max-w-4xl mx-auto flex-wrap justify-center sm:justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1 sm:gap-2">
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-[10px]">{label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Demo Guide
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      asChild
                    >
                      <Link to={feature.path}>
                        <Play className="w-4 h-4 mr-2" />
                        Try It Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demo Mode CTA */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Try Demo Mode
            </CardTitle>
            <CardDescription>
              Want to explore with sample data? Create a demo project with realistic data pre-loaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link to="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                Create Demo Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Demo Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          {selectedFeature && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = selectedFeature.icon;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                  <DialogTitle className="text-2xl">{selectedFeature.title}</DialogTitle>
                </div>
                <DialogDescription className="text-base">
                  {selectedFeature.description}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[50vh] pr-4">
                <div className="space-y-6">
                  {/* How to Use */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      How to Use
                    </h3>
                    <ol className="space-y-2">
                      {selectedFeature.demoSteps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Key Benefits
                    </h3>
                    <ul className="space-y-2">
                      {selectedFeature.benefits.map((benefit, index) => (
                        <li key={index} className="flex gap-2">
                          <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex gap-3 mt-4">
                <Button className="flex-1" asChild>
                  <Link to={selectedFeature.path}>
                    <Play className="w-4 h-4 mr-2" />
                    Try This Feature
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setSelectedFeature(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
