import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useVelocityTruth, type Simulation } from "@/hooks/useVelocityTruth";
import { Activity, TrendingUp, Gauge, Sparkles, RefreshCw, Target } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";

const bandColor = (b: string) =>
  b === "high" ? "bg-primary/15 text-primary" : b === "medium" ? "bg-accent/15 text-accent-foreground" : "bg-muted text-muted-foreground";

export default function VelocityTruth() {
  useRequireAuth();
  const { workspace, signals, tags, loading, ingesting, error, ingest, simulate } = useVelocityTruth();

  // Guard the array mapping against null or undefined database states
  const activeSignals = signals ?? [];
  const activeTags = tags ?? [];

  const [teamDelta, setTeamDelta] = useState(0);
  const [scopeDelta, setScopeDelta] = useState(0);
  const [sim, setSim] = useState<Simulation | null>(null);
  const [simBusy, setSimBusy] = useState(false);

  // Safely processing throughput chart data points from active array states
  const throughputChart = useMemo(
    () => activeSignals.map(s => ({
      date: s.snapshot_date ? s.snapshot_date.slice(5) : "—",
      throughput: (s.prs_merged ?? 0) + (s.issues_resolved ?? 0),
      lead: s.lead_time_p50_hours ? Number((s.lead_time_p50_hours / 24).toFixed(1)) : 0,
    })),
    [activeSignals],
  );

  const latest = activeSignals.length ? activeSignals[activeSignals.length - 1] : null;
  
  const avgThroughput = activeSignals.length
    ? Math.round(activeSignals.reduce((a, s) => a + (s.prs_merged ?? 0) + (s.issues_resolved ?? 0), 0) / activeSignals.length)
    : 0;

  const valueByBand = useMemo(() => {
    const acc: Record<string, number> = { high: 0, medium: 0, low: 0 };
    for (const t of activeTags) {
      if (t.value_band) acc[t.value_band] = (acc[t.value_band] ?? 0) + 1;
    }
    return acc;
  }, [activeTags]);

  const runSimulation = async () => {
    setSimBusy(true);
    try {
      const result = await simulate({ teamDelta, scopeDeltaPct: scopeDelta });
      setSim(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setSimBusy(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Velocity Truth | Spark-Agile</title>
        <meta name="description" content="Your team's real delivery velocity and business value, learned from your own data. Decide with evidence, not headcount cuts." />
      </Helmet>

      <div className="space-y-6">
        {/* Hero */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Velocity Truth</h1>
            <p className="text-muted-foreground max-w-2xl">
              The real rate at which your team turns work into value, learned from your own GitHub and Jira history. No vanity metrics, no industry averages.
            </p>
          </div>
          <Button onClick={ingest} disabled={ingesting} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${ingesting ? "animate-spin" : ""}`} />
            {ingesting ? "Learning..." : "Refresh signals"}
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {activeSignals.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No signals yet</CardTitle>
              <CardDescription>
                Connect GitHub or Jira, then click "Refresh signals" to compute your first daily snapshot. Spark-Agile only learns from your real data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={ingest} disabled={ingesting}>
                <Sparkles className="h-4 w-4 mr-2" />
                Compute today's signals
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Panel 1: Real velocity */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Your real velocity
                    </CardTitle>
                    <CardDescription>
                      Rolling 12-week throughput and lead time, learned from {activeSignals.length} daily snapshot{activeSignals.length === 1 ? "" : "s"}.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{avgThroughput}</p>
                    <p className="text-xs text-muted-foreground">items shipped / week (avg)</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Stat label="Latest throughput" value={`${(latest?.prs_merged ?? 0) + (latest?.issues_resolved ?? 0)}`} hint="items / 7d" />
                  <Stat label="Lead time p50" value={latest?.lead_time_p50_hours ? `${(Number(latest.lead_time_p50_hours) / 24).toFixed(1)}d` : "—"} hint="idea → shipped" />
                  <Stat label="WIP" value={`${latest?.wip_count ?? 0}`} hint="open items" />
                  <Stat label="Blocked" value={`${latest?.blocked_count ?? 0}`} hint="active blockers" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={throughputChart}>
                      <defs>
                        <linearGradient id="tput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Area type="monotone" dataKey="throughput" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#tput)" name="Throughput" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Panel 2: Value shipped vs planned */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Business value in flight
                </CardTitle>
                <CardDescription>
                  Tag epics with value to see what your delivery is actually worth, not just how many tickets close.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No value tags yet. Open any epic and add a value tag (band + optional monetary estimate) to enable value-based decisions.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Stat label="High value" value={`${valueByBand.high}`} hint="epics tagged" />
                      <Stat label="Medium value" value={`${valueByBand.medium}`} hint="epics tagged" />
                      <Stat label="Low value" value={`${valueByBand.low}`} hint="epics tagged" />
                    </div>
                    <Separator />
                    <ul className="space-y-2 max-h-56 overflow-auto">
                      {activeTags.slice(0, 10).map(t => (
                        <li key={t.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge className={bandColor(t.value_band)} variant="outline">{t.value_band}</Badge>
                            <span className="text-muted-foreground">{t.value_type ? t.value_type.replace("_", " ") : "—"}</span>
                          </div>
                          <span className="font-medium">
                            {t.estimated_amount ? `${t.currency ?? "GBP"} ${Number(t.estimated_amount).toLocaleString()}` : "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel 3: Decision simulator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Decision simulator
                </CardTitle>
                <CardDescription>
                  "What happens if we change the team or the scope?" Answered from your own signals, not a generic model.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Team size change</span>
                      <span className="font-medium">{teamDelta >= 0 ? "+" : ""}{teamDelta} {Math.abs(teamDelta) === 1 ? "person" : "people"}</span>
                    </div>
                    <Slider min={-5} max={5} step={1} value={[teamDelta]} onValueChange={v => setTeamDelta(v[0])} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Scope change</span>
                      <span className="font-medium">{scopeDelta >= 0 ? "+" : ""}{scopeDelta}%</span>
                    </div>
                    <Slider min={-50} max={50} step={5} value={[scopeDelta]} onValueChange={v => setScopeDelta(v[0])} />
                  </div>
                </div>

                <Button onClick={runSimulation} disabled={simBusy}>
                  <Gauge className="h-4 w-4 mr-2" />
                  {simBusy ? "Simulating..." : "Run simulation"}
                </Button>

                {sim && (
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">Confidence: {sim.confidence}</Badge>
                      <Badge variant="outline">{sim.baseline.dataPoints} data points</Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{sim.insight}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Stat label="Team" value={`${sim.baseline.teamSize} → ${sim.projection.teamSize}`} hint="people" />
                      <Stat label="Throughput" value={`${sim.baseline.weeklyThroughput} → ${sim.projection.weeklyThroughput}`} hint={`${sim.projection.throughputChangePct >= 0 ? "+" : ""}${sim.projection.throughputChangePct}%`} />
                      <Stat label="Lead time" value={`${sim.baseline.leadTimeDays}d → ${sim.projection.leadTimeDays}d`} hint={`${sim.projection.leadChangePct >= 0 ? "+" : ""}${sim.projection.leadChangePct}%`} />
                      <Stat label="Value retained" value={`${sim.value.valueRetainedPct}%`} hint={sim.value.totalMonetary ? `~${sim.value.totalMonetary.toLocaleString()} total` : "tagged epics"} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border bg-card/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}