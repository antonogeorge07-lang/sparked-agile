import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUIMode } from "@/hooks/useUIMode";
import {
  Briefcase, GitBranch, TrendingUp, Workflow, Network, Upload,
  Users, Calendar, Presentation, ListFilter, Sparkles, ExternalLink,
  FolderKanban, MessageCircle, BookOpen, BarChart3, Target,
} from "lucide-react";

const sections = [
  {
    label: "Plan & track",
    items: [
      { title: "Command Centre", url: "/project-command-centre", icon: Briefcase, desc: "Stages, tasks, risks, lessons learned." },
      { title: "Sprint planning", url: "/sprint-planning-assistant", icon: Sparkles, desc: "AI-assisted sprint composition." },
      { title: "My workspace", url: "/my-projects", icon: FolderKanban, desc: "All projects you own or collaborate on." },
      { title: "External tasks", url: "/external-tasks", icon: ExternalLink, desc: "Jira, GitHub, Slack in one place." },
      { title: "Team hub", url: "/team-hub", icon: MessageCircle, desc: "Native workspace chat." },
    ],
  },
  {
    label: "Ceremonies",
    items: [
      { title: "Daily standup", url: "/standup", icon: Users, desc: "Async stand-up capture." },
      { title: "Sprint review", url: "/sprint-review-coordinator", icon: Presentation, desc: "Demo coordination." },
      { title: "Retrospective", url: "/retrospective", icon: Calendar, desc: "What went well, what didn't." },
      { title: "Backlog refinement", url: "/backlog-refinement", icon: ListFilter, desc: "Groom the queue." },
    ],
  },
  {
    label: "Insight & flow",
    items: [
      { title: "Epics", url: "/epic-management", icon: GitBranch, desc: "Portfolio, Gantt, ROI, validators." },
      { title: "Flow metrics", url: "/flow-metrics", icon: TrendingUp, desc: "Lead time, throughput, forecasts." },
      { title: "Value streams", url: "/value-streams", icon: Target, desc: "End-to-end delivery view." },
      { title: "Program increment", url: "/program-increment", icon: BarChart3, desc: "SAFe PI planning." },
      { title: "Usage analytics", url: "/usage-analytics", icon: BarChart3, desc: "Platform usage." },
    ],
  },
  {
    label: "Power tools",
    items: [
      { title: "Workflows", url: "/workflows", icon: Workflow, desc: "Automations and rules." },
      { title: "Integrations", url: "/integrations", icon: Network, desc: "Advanced connector config." },
      { title: "Import data", url: "/import", icon: Upload, desc: "CSV / JSON bulk import." },
      { title: "User guide", url: "/user-guide", icon: BookOpen, desc: "Documentation." },
    ],
  },
];

export default function Advanced() {
  const { mode, setMode } = useUIMode();

  return (
    <DashboardLayout>
      <Helmet>
        <title>Advanced — Spark-Agile</title>
        <meta name="description" content="All Spark-Agile capabilities. Power tools for teams that want the full surface area." />
      </Helmet>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Advanced</h1>
          <p className="text-muted-foreground max-w-2xl">
            Spark-Agile's full toolkit. The briefing remains the product.
            Everything here is optional scaffolding for teams that want it.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">
              Current mode: <span className="font-medium text-foreground">{mode === "simple" ? "Simple" : "Advanced"}</span>
            </span>
            <Button
              size="sm"
              variant={mode === "advanced" ? "secondary" : "default"}
              onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}
            >
              {mode === "simple" ? "Switch to Advanced mode" : "Back to Simple mode"}
            </Button>
          </div>
        </header>

        {sections.map((section) => (
          <section key={section.label} className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              {section.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <Card key={item.url} className="hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <item.icon className="h-4 w-4 text-primary" />
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs">{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link to={item.url}>Open</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
