import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GitPullRequest,
  RefreshCw,
  Rocket,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import MacAppLayout from "../components/MacAppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useBriefing, type BriefItem, type DailyBriefingMetrics } from "@/hooks/useBriefing";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceProjects } from "@/hooks/useWorkspaceProjects";

const queues = {
  shipped: {
    title: "Shipped",
    description: "Merged pull requests and resolved Jira work in the last seven days.",
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
  stuck: {
    title: "Blocked",
    description: "Active work explicitly marked as blocked.",
    icon: AlertTriangle,
    tone: "text-amber-600",
  },
  decide: {
    title: "Work in progress",
    description: "Open work that requires attention, review, or a delivery decision.",
    icon: Activity,
    tone: "text-blue-600",
  },
} as const;

function formatDuration(hours: number | null) {
  if (hours === null) return "Not enough data";
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
}

function SnapshotTable({ metrics }: { metrics: DailyBriefingMetrics }) {
  const rows = [
    ["Pull requests merged", metrics.pullRequestsMerged, "GitHub · last 7 days"],
    ["Jira issues resolved", metrics.issuesResolved, "Jira · last 7 days"],
    ["Work in progress", metrics.workInProgress, "GitHub + Jira · current"],
    ["Blocked items", metrics.blocked, "GitHub + Jira · current"],
    ["Deployments", metrics.deployments, "GitHub · last 7 days"],
    ["Median cycle time", formatDuration(metrics.cycleTimeHours), "Pull request open → merge"],
    ["Median lead time", formatDuration(metrics.leadTimeHours), "Jira creation → resolution"],
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Delivery measure</TableHead>
          <TableHead className="text-right">Current value</TableHead>
          <TableHead className="hidden text-right md:table-cell">Evidence window</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([label, value, evidence]) => (
          <TableRow key={String(label)}>
            <TableCell className="font-medium">{label}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{value}</TableCell>
            <TableCell className="hidden text-right text-muted-foreground md:table-cell">{evidence}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SignalTable({ items, emptyLabel }: { items: BriefItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work item</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="hidden md:table-cell">Owner</TableHead>
            <TableHead className="text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.source}-${item.context}-${item.key}`}>
              <TableCell>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-primary"
                >
                  <span className="mr-2 text-muted-foreground">{item.key}</span>
                  {item.title}
                  <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{item.context}</p>
              </TableCell>
              <TableCell><Badge variant="outline" className="capitalize">{item.source}</Badge></TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{item.author}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {new Date(item.updatedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Briefing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { projects, loading: projectsLoading } = useWorkspaceProjects(workspace?.id);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  useEffect(() => {
    if (!workspace?.id) {
      setConnectionsLoading(false);
      return;
    }
    let cancelled = false;
    setConnectionsLoading(true);
    supabase
      .from("integrations")
      .select("project_id")
      .eq("is_active", true)
      .in("integration_type", ["github", "jira"])
      .then(({ data, error }) => {
        if (cancelled) return;
        setConnectedIds(error
          ? new Set()
          : new Set((data ?? []).map((row) => row.project_id).filter(Boolean)));
        setConnectionsLoading(false);
      });
    return () => { cancelled = true; };
  }, [workspace?.id]);

  const connectedProjects = useMemo(
    () => projects.filter((project) => connectedIds.has(project.id)),
    [projects, connectedIds],
  );
  const requestedProject = searchParams.get("project");
  const selectedProjectId = connectedProjects.some((project) => project.id === requestedProject)
    ? requestedProject ?? undefined
    : connectedProjects[0]?.id;
  const selectedProject = connectedProjects.find((project) => project.id === selectedProjectId);

  useEffect(() => {
    if (selectedProjectId && requestedProject !== selectedProjectId) {
      setSearchParams({ project: selectedProjectId }, { replace: true });
    }
  }, [requestedProject, selectedProjectId, setSearchParams]);

  const { data, loading, error, refresh } = useBriefing(selectedProjectId);
  const pageLoading = workspaceLoading || projectsLoading || connectionsLoading;

  if (pageLoading) {
    return <MacAppLayout><LoadingState message="Loading connected projects..." /></MacAppLayout>;
  }

  return (
    <MacAppLayout>
      <main className="mx-auto max-w-7xl space-y-6" aria-live="polite">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Delivery truth</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Executive Delivery Briefing</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Daily GitHub and Jira evidence for {selectedProject?.name ?? "your selected project"}.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <Select
              value={selectedProjectId}
              onValueChange={(project) => setSearchParams({ project })}
              disabled={connectedProjects.length === 0}
            >
              <SelectTrigger className="w-full sm:w-72" aria-label="Connected project">
                <SelectValue placeholder="Select a connected project" />
              </SelectTrigger>
              <SelectContent>
                {connectedProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => void refresh()} disabled={!selectedProjectId || loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing" : "Refresh data"}
            </Button>
          </div>
        </header>

        {connectedProjects.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No connected projects</CardTitle>
              <CardDescription>Connect GitHub or Jira to populate a project briefing.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {error && !data && (
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Daily data unavailable</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {loading && <LoadingState message="Refreshing the selected project..." />}

        {!loading && data && (
          <>
            <section className="grid gap-4 md:grid-cols-3" aria-label="Delivery queues">
              {(Object.keys(queues) as Array<keyof typeof queues>).map((key) => {
                const Icon = queues[key].icon;
                return (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardDescription>{queues[key].title}</CardDescription>
                        <Icon className={`h-5 w-5 ${queues[key].tone}`} />
                      </div>
                      <CardTitle className={`text-4xl tabular-nums ${queues[key].tone}`}>
                        {data[key].count}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{queues[key].description}</CardContent>
                  </Card>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Daily delivery snapshot
                  </CardTitle>
                  <CardDescription>
                    {data.metrics
                      ? `Persisted for ${new Date(data.metrics.snapshotDate).toLocaleDateString()}`
                      : "Live source summary; daily snapshot is still being prepared."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.metrics
                    ? <SnapshotTable metrics={data.metrics} />
                    : <p className="py-6 text-sm text-muted-foreground">Refresh data to create today’s project snapshot.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitPullRequest className="h-5 w-5 text-primary" />
                    Connected evidence
                  </CardTitle>
                  <CardDescription>Only sources attached to the selected project are included.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-sm text-muted-foreground">GitHub repositories</span>
                    <span className="font-semibold tabular-nums">{data.repos.length}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-sm text-muted-foreground">Jira sites</span>
                    <span className="font-semibold tabular-nums">{data.jiraSites.length}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-sm text-muted-foreground">Deployments</span>
                    <span className="font-semibold tabular-nums">{data.metrics?.deployments ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock3 className="h-4 w-4" />Last refreshed
                    </span>
                    <span className="text-sm font-medium">{new Date(data.generatedAt).toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Executive intelligence
                    </CardTitle>
                    <CardDescription className="mt-1">
                      AI interpretation is separated from verified GitHub and Jira figures.
                    </CardDescription>
                  </div>
                  <Badge variant={data.intelligence.used ? "default" : "secondary"}>
                    {data.intelligence.used ? "LLM in use" : "LLM not used"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6">{data.intelligence.summary}</p>
                <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                  <div><span className="text-muted-foreground">Provider</span><p className="font-medium">{data.intelligence.used ? "Lovable AI Gateway" : "Deterministic metrics"}</p></div>
                  <div><span className="text-muted-foreground">Model</span><p className="font-medium">{data.intelligence.model ?? "None"}</p></div>
                  <div><span className="text-muted-foreground">Execution</span><p className="font-medium capitalize">{data.intelligence.status}</p></div>
                </div>
              </CardContent>
            </Card>

            {(Object.keys(queues) as Array<keyof typeof queues>).map((key) => {
              const Icon = queues[key].icon;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${queues[key].tone}`} />
                      {queues[key].title}
                    </CardTitle>
                    <CardDescription>{queues[key].description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SignalTable
                      items={data[key].items}
                      emptyLabel={`No ${queues[key].title.toLowerCase()} items were returned for this project.`}
                    />
                  </CardContent>
                </Card>
              );
            })}

            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Rocket className="h-3.5 w-3.5" />
              Snapshot generated {new Date(data.generatedAt).toLocaleString()}
            </p>
          </>
        )}
      </main>
    </MacAppLayout>
  );
}
