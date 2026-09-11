import { useEffect, useMemo, useState } from "react";
import { ExternalLink, GitPullRequest, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import MacAppLayout from "../components/MacAppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useBriefing, type BriefItem } from "@/hooks/useBriefing";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceProjects } from "@/hooks/useWorkspaceProjects";

const bucketMeta = {
  shipped: { title: "Shipped", description: "Merged or resolved in the last seven days", tone: "text-emerald-600" },
  stuck: { title: "Stuck", description: "Open work without recent movement", tone: "text-amber-600" },
  decide: { title: "Needs a decision", description: "Open work waiting for review", tone: "text-blue-600" },
} as const;

function SignalTable({ items }: { items: BriefItem[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">No matching activity for this project.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-3 pr-4 font-medium">Item</th>
            <th className="py-3 pr-4 font-medium">Source</th>
            <th className="py-3 pr-4 font-medium">Owner</th>
            <th className="py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.source}-${item.context}-${item.key}`} className="border-b last:border-0">
              <td className="py-3 pr-4">
                <a href={item.url} target="_blank" rel="noreferrer" className="font-medium hover:text-primary">
                  <span className="mr-2 text-muted-foreground">{item.key}</span>{item.title}
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{item.context}</p>
              </td>
              <td className="py-3 pr-4"><Badge variant="outline">{item.source}</Badge></td>
              <td className="py-3 pr-4 text-muted-foreground">{item.author}</td>
              <td className="py-3 text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    if (!workspace?.id) return;
    let cancelled = false;
    setConnectionsLoading(true);
    supabase
      .from("integrations")
      .select("project_id")
      .eq("is_active", true)
      .in("integration_type", ["github", "jira"])
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setConnectedIds(new Set());
        } else {
          setConnectedIds(new Set((data ?? []).map((row) => row.project_id).filter(Boolean)));
        }
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

  useEffect(() => {
    if (selectedProjectId && requestedProject !== selectedProjectId) {
      setSearchParams({ project: selectedProjectId }, { replace: true });
    }
  }, [requestedProject, selectedProjectId, setSearchParams]);

  const { data, loading, error, refresh } = useBriefing(selectedProjectId);
  const pageLoading = workspaceLoading || projectsLoading || connectionsLoading;

  if (pageLoading) return <MacAppLayout><LoadingState message="Loading connected projects..." /></MacAppLayout>;

  return (
    <MacAppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Briefing</h1>
            <p className="mt-1 text-muted-foreground">Live delivery evidence from the selected project's GitHub and Jira connections.</p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Select
              value={selectedProjectId}
              onValueChange={(project) => setSearchParams({ project })}
              disabled={connectedProjects.length === 0}
            >
              <SelectTrigger className="w-full md:w-72" aria-label="Connected project">
                <SelectValue placeholder="Select a connected project" />
              </SelectTrigger>
              <SelectContent>
                {connectedProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => void refresh()} disabled={!selectedProjectId || loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {connectedProjects.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No connected projects</CardTitle>
              <CardDescription>Connect GitHub or Jira to a project to populate this briefing.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {loading && <LoadingState message="Building the selected project briefing..." />}

        {!loading && data && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(bucketMeta) as Array<keyof typeof bucketMeta>).map((key) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardDescription>{bucketMeta[key].title}</CardDescription>
                    <CardTitle className={`text-4xl ${bucketMeta[key].tone}`}>{data[key].count}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{bucketMeta[key].description}</CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GitPullRequest className="h-5 w-5" />Delivery activity</CardTitle>
                <CardDescription>
                  {data.repos.length} GitHub repositor{data.repos.length === 1 ? "y" : "ies"} and {data.jiraSites.length} Jira site{data.jiraSites.length === 1 ? "" : "s"} linked to this project.
                </CardDescription>
              </CardHeader>
            </Card>

            {(Object.keys(bucketMeta) as Array<keyof typeof bucketMeta>).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {key === "stuck" ? <ShieldAlert className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    {bucketMeta[key].title}
                  </CardTitle>
                  <CardDescription>{bucketMeta[key].description}</CardDescription>
                </CardHeader>
                <CardContent><SignalTable items={data[key].items} /></CardContent>
              </Card>
            ))}

            <p className="text-xs text-muted-foreground">Generated {new Date(data.generatedAt).toLocaleString()}</p>
          </>
        )}
      </div>
    </MacAppLayout>
  );
}
