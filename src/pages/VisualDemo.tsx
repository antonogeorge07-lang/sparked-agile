import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Target, Users, BarChart3, GitBranch,
  Calendar, Presentation, TrendingUp, Workflow, MessageSquare,
  CheckSquare, FileText, Shield, Briefcase, Play, Search,
  ArrowRight, Sparkles, ListFilter, Settings, BookOpen,
  Globe, Layers, Eye, ExternalLink, Maximize2, X,
  Home, Rocket, FolderOpen, Gauge, Activity, Zap, 
  PieChart, Link as LinkIcon, ClipboardList, Monitor
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PageDemo {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "core" | "planning" | "execution" | "analytics" | "management" | "info";
  path: string;
  tag?: string;
}

const pages: PageDemo[] = [
  // Core
  { id: "landing", title: "Landing Page", description: "Public-facing marketing page with hero, features, and pricing", icon: Globe, category: "core", path: "/", tag: "Public" },
  { id: "home", title: "Home Dashboard", description: "Main authenticated user home with project overview", icon: Home, category: "core", path: "/home" },
  { id: "quick-start", title: "Quick Start", description: "Guided onboarding to get new users up and running", icon: Rocket, category: "core", path: "/quick-start" },
  { id: "getting-started", title: "Getting Started", description: "Step-by-step setup guide for the platform", icon: BookOpen, category: "core", path: "/getting-started" },
  { id: "auth", title: "Authentication", description: "Sign in and sign up flows with email verification", icon: Shield, category: "core", path: "/auth", tag: "Auth" },

  // Planning
  { id: "sprint-planning", title: "Sprint Planning Assistant", description: "AI-powered sprint planning with JIRA sync and meeting coordination", icon: Target, category: "planning", path: "/sprint-planning-assistant" },
  { id: "backlog", title: "Backlog Refinement", description: "Prioritise and refine product backlog with AI assistance", icon: ListFilter, category: "planning", path: "/backlog-refinement" },
  { id: "epic-management", title: "Epic Management", description: "Manage large initiatives, track dependencies and progress", icon: Layers, category: "planning", path: "/epic-management" },
  { id: "epic-portfolio", title: "Epic Portfolio", description: "Portfolio view of all epics with health scores and timelines", icon: Briefcase, category: "planning", path: "/epic-portfolio" },
  { id: "program-increment", title: "Program Increment", description: "SAFe PI planning with objectives and cross-team coordination", icon: Calendar, category: "planning", path: "/program-increment" },
  { id: "ceremony-setup", title: "Ceremony Setup", description: "Configure recurring agile ceremonies and reminders", icon: Settings, category: "planning", path: "/ceremony-setup" },

  // Execution
  { id: "command-centre", title: "Project Command Centre", description: "Centralised Kanban board with AI insights and risk tracking", icon: Monitor, category: "execution", path: "/project-command-centre" },
  { id: "standup", title: "Daily Standup", description: "Team standup updates with AI-powered summaries", icon: Users, category: "execution", path: "/standup" },
  { id: "sprint-review", title: "Sprint Review Coordinator", description: "Prepare demo checklists and coordinate stakeholder reviews", icon: Presentation, category: "execution", path: "/sprint-review-coordinator" },
  { id: "retrospective", title: "Sprint Retrospective", description: "Collaborative retros with AI insights and action tracking", icon: MessageSquare, category: "execution", path: "/retrospective" },
  { id: "task-management", title: "Task Management", description: "Native task board with drag-and-drop and progress tracking", icon: CheckSquare, category: "execution", path: "/task-management" },
  { id: "workflows", title: "Workflow Automation", description: "Automate repetitive tasks with custom workflow templates", icon: Workflow, category: "execution", path: "/workflows" },

  // Analytics
  { id: "dashboard", title: "Project Dashboard", description: "Real-time velocity, sprint progress, and team metrics", icon: LayoutDashboard, category: "analytics", path: "/dashboard" },
  { id: "usage-analytics", title: "Usage Analytics", description: "Platform usage metrics, AI consumption, and team activity", icon: BarChart3, category: "analytics", path: "/usage-analytics" },
  { id: "project-progress", title: "Project Progress", description: "Burndown charts, milestone tracking, and delivery forecasts", icon: TrendingUp, category: "analytics", path: "/project-progress" },
  { id: "flow-metrics", title: "Flow Metrics", description: "Cycle time, throughput, WIP limits, and flow efficiency", icon: Activity, category: "analytics", path: "/flow-metrics" },
  { id: "value-streams", title: "Value Streams", description: "End-to-end value stream mapping and optimisation", icon: GitBranch, category: "analytics", path: "/value-streams" },

  // Management
  { id: "my-projects", title: "My Projects", description: "Browse, create, and manage all your projects", icon: FolderOpen, category: "management", path: "/my-projects" },
  { id: "workspace-settings", title: "Workspace Settings", description: "Team members, integrations, and workspace configuration", icon: Settings, category: "management", path: "/workspace/settings" },
  { id: "integrations", title: "Integrations", description: "Connect JIRA, GitHub, Slack, Outlook, and more", icon: LinkIcon, category: "management", path: "/integrations" },
  { id: "stakeholder-portal", title: "Stakeholder Portal", description: "External stakeholder visibility with approval workflows", icon: Eye, category: "management", path: "/stakeholder-portal" },

  // Info
  { id: "features", title: "Features", description: "Comprehensive overview of all platform capabilities", icon: Sparkles, category: "info", path: "/features", tag: "Public" },
  { id: "feature-demo", title: "Feature Demos", description: "Interactive walkthroughs of key platform features", icon: Play, category: "info", path: "/feature-demo", tag: "Public" },
  { id: "about", title: "About", description: "Our mission, team, and the story behind SAAI", icon: BookOpen, category: "info", path: "/about", tag: "Public" },
  { id: "faq", title: "FAQ", description: "Frequently asked questions and troubleshooting", icon: ClipboardList, category: "info", path: "/faq", tag: "Public" },
  { id: "contact", title: "Contact", description: "Get in touch with the SAAI team", icon: MessageSquare, category: "info", path: "/contact", tag: "Public" },
  { id: "user-guide", title: "User Guide", description: "Comprehensive documentation and usage guides", icon: FileText, category: "info", path: "/user-guide", tag: "Public" },
];

const categories = {
  core: { label: "Core", icon: Home, color: "from-primary to-primary/70" },
  planning: { label: "Planning", icon: Target, color: "from-accent to-accent/70" },
  execution: { label: "Execution", icon: Zap, color: "from-emerald-500 to-emerald-400" },
  analytics: { label: "Analytics", icon: PieChart, color: "from-amber-500 to-amber-400" },
  management: { label: "Management", icon: Settings, color: "from-rose-500 to-rose-400" },
  info: { label: "Info Pages", icon: FileText, color: "from-sky-500 to-sky-400" },
};

export default function VisualDemo() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewPage, setPreviewPage] = useState<PageDemo | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filtered = pages.filter(p => {
    const matchesSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getPreviewUrl = useCallback((path: string) => {
    return `${window.location.origin}${path}`;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 mt-16">
        <BackButton className="mb-4" />

        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4" variant="secondary">
            <Eye className="w-3 h-3 mr-1" />
            Visual Page Gallery
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            SAAI Platform Pages
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore every page in the platform — click any card to preview it live, or navigate directly
          </p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All ({pages.length})
            </Button>
            {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="gap-1"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{label}</span>
                <span className="text-xs">({pages.filter(p => p.category === key).length})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Category sections */}
        {(selectedCategory === "all" ? Object.keys(categories) : [selectedCategory]).map(catKey => {
          const cat = categories[catKey as keyof typeof categories];
          const catPages = filtered.filter(p => p.category === catKey);
          if (catPages.length === 0) return null;

          return (
            <motion.div
              key={catKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${cat.color}`} />
                <h2 className="text-xl font-bold text-foreground">{cat.label}</h2>
                <Badge variant="outline" className="text-xs">{catPages.length} pages</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {catPages.map((page, i) => {
                  const Icon = page.icon;
                  return (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden">
                        {/* Mini preview area */}
                        <div 
                          className="relative h-36 bg-muted/30 border-b border-border/30 overflow-hidden cursor-pointer"
                          onClick={() => setPreviewPage(page)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium shadow-sm">
                                <Maximize2 className="w-3.5 h-3.5" />
                                Preview
                              </div>
                            </div>
                          </div>
                          {page.tag && (
                            <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">
                              {page.tag}
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-3">
                          <div className="flex items-start gap-2 mb-1.5">
                            <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <h3 className="font-semibold text-sm leading-tight">{page.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 ml-6">
                            {page.description}
                          </p>
                          <div className="flex gap-2 ml-6">
                            <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setPreviewPage(page)}>
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" className="h-7 text-xs flex-1" asChild>
                              <Link to={page.path}>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Visit
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No pages match your search</p>
            <p className="text-sm">Try a different keyword or category</p>
          </div>
        )}
      </div>

      {/* Live Preview Dialog */}
      <Dialog open={!!previewPage} onOpenChange={() => setPreviewPage(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          {previewPage && (
            <div className="flex flex-col h-full">
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = previewPage.icon;
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                  <div>
                    <h3 className="font-semibold text-sm">{previewPage.title}</h3>
                    <p className="text-xs text-muted-foreground">{previewPage.path}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={previewPage.path}>
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Open Full Page
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Iframe preview */}
              <div className="flex-1 bg-muted/10">
                <iframe
                  ref={iframeRef}
                  src={getPreviewUrl(previewPage.path)}
                  className="w-full h-full border-0"
                  title={`Preview: ${previewPage.title}`}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
