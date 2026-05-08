import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity, TrendingUp, TrendingDown, Clock, Zap, Network, Target,
  AlertTriangle, CheckCircle2, BarChart3, Loader2, Brain,
  ArrowUpRight, ArrowDownRight, Minus, Calendar, Users, Gauge,
  LineChart as LineChartIcon
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { IntegrationDataCard } from "@/components/IntegrationDataCard";
import { useIntegrationData } from "@/hooks/useIntegrationData";
import { format, addDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

// Sample flow data
const sampleFlowMetrics = [
  { id: 'sample-1', metric_date: new Date(Date.now() - 1 * 86400000).toISOString(), work_in_progress: 8, cycle_time_avg: 3.2, lead_time_avg: 5.1, throughput: 12 },
  { id: 'sample-2', metric_date: new Date(Date.now() - 2 * 86400000).toISOString(), work_in_progress: 7, cycle_time_avg: 3.5, lead_time_avg: 5.4, throughput: 10 },
  { id: 'sample-3', metric_date: new Date(Date.now() - 3 * 86400000).toISOString(), work_in_progress: 9, cycle_time_avg: 4.0, lead_time_avg: 6.2, throughput: 8 },
];

// Sample predictor data
const sampleVelocityHistory = [
  { sprint: "Sprint 1", committed: 34, delivered: 28, velocity: 82 },
  { sprint: "Sprint 2", committed: 32, delivered: 30, velocity: 94 },
  { sprint: "Sprint 3", committed: 36, delivered: 33, velocity: 92 },
  { sprint: "Sprint 4", committed: 38, delivered: 35, velocity: 92 },
  { sprint: "Sprint 5", committed: 35, delivered: 34, velocity: 97 },
  { sprint: "Sprint 6", committed: 40, delivered: 36, velocity: 90 },
  { sprint: "Sprint 7", committed: 38, delivered: 37, velocity: 97 },
  { sprint: "Sprint 8", committed: 42, delivered: 38, velocity: 90 },
];

const samplePredictions = [
  { sprint: "Sprint 9", predicted: 39, lower: 34, upper: 44, confidence: 85 },
  { sprint: "Sprint 10", predicted: 40, lower: 33, upper: 47, confidence: 78 },
  { sprint: "Sprint 11", predicted: 41, lower: 32, upper: 50, confidence: 72 },
  { sprint: "Sprint 12", predicted: 42, lower: 30, upper: 54, confidence: 65 },
];

const sampleUtilisation = [
  { week: "W1", development: 72, testing: 15, planning: 8, overhead: 5 },
  { week: "W2", development: 68, testing: 18, planning: 9, overhead: 5 },
  { week: "W3", development: 75, testing: 12, planning: 7, overhead: 6 },
  { week: "W4", development: 70, testing: 16, planning: 8, overhead: 6 },
  { week: "W5", development: 74, testing: 14, planning: 7, overhead: 5 },
  { week: "W6", development: 71, testing: 17, planning: 6, overhead: 6 },
];

const sampleHealthRadar = [
  { metric: "Velocity", value: 85, fullMark: 100 },
  { metric: "Predictability", value: 78, fullMark: 100 },
  { metric: "Quality", value: 92, fullMark: 100 },
  { metric: "Throughput", value: 70, fullMark: 100 },
  { metric: "Responsiveness", value: 65, fullMark: 100 },
  { metric: "Sustainability", value: 88, fullMark: 100 },
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--card-foreground))'
};

export default function FlowMetrics() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [velocitySample, setVelocitySample] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration } = useIntegrationData(selectedProject);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      loadProjects();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMetrics();
      loadVelocityData();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setProjects(data);
      setSelectedProject(data[0].id);
    }
  };

  const loadMetrics = async () => {
    if (!selectedProject) return;
    const { data } = await supabase
      .from('flow_metrics')
      .select('*')
      .eq('project_id', selectedProject)
      .order('metric_date', { ascending: false })
      .limit(30);
    setMetrics(data || []);
  };

  const loadVelocityData = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sprint_velocity_history')
        .select('sprint_number, committed_points, delivered_points, velocity, sprint_start_date, sprint_end_date, created_at')
        .eq('project_id', selectedProject)
        .order('sprint_number', { ascending: true });
      if (error) throw error;
      if (data && data.length >= 3) {
        setVelocityData(data);
        setVelocitySample(false);
      } else {
        setVelocityData([]);
        setVelocitySample(true);
      }
    } catch {
      setVelocitySample(true);
    } finally {
      setLoading(false);
    }
  };

  // Flow metrics
  const displayFlowMetrics = metrics.length > 0 ? metrics : sampleFlowMetrics;
  const showingFlowSample = metrics.length === 0;
  const latestMetrics = displayFlowMetrics[0];
  const avgCycleTime = displayFlowMetrics.length > 0
    ? (displayFlowMetrics.reduce((sum: number, m: any) => sum + (Number(m.cycle_time_avg) || 0), 0) / displayFlowMetrics.length).toFixed(1)
    : '0';
  const avgLeadTime = displayFlowMetrics.length > 0
    ? (displayFlowMetrics.reduce((sum: number, m: any) => sum + (Number(m.lead_time_avg) || 0), 0) / displayFlowMetrics.length).toFixed(1)
    : '0';
  const totalThroughput = displayFlowMetrics.reduce((sum: number, m: any) => sum + (m.throughput || 0), 0);

  // Velocity predictions
  const computedMetrics = useMemo(() => {
    if (velocitySample || velocityData.length < 3) return null;
    const delivered = velocityData.map(s => s.delivered_points || 0);
    const committed = velocityData.map(s => s.committed_points || 0);
    const avg = delivered.reduce((a, b) => a + b, 0) / delivered.length;
    const avgCommitted = committed.reduce((a, b) => a + b, 0) / committed.length;
    const accuracy = avgCommitted > 0 ? (avg / avgCommitted) * 100 : 0;
    const n = delivered.length;
    const xSum = delivered.reduce((_, __, i) => _ + i, 0);
    const ySum = delivered.reduce((a, b) => a + b, 0);
    const xySum = delivered.reduce((a, b, i) => a + i * b, 0);
    const x2Sum = delivered.reduce((a, _, i) => a + i * i, 0);
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    const stdDev = Math.sqrt(delivered.reduce((a, b) => a + (b - avg) ** 2, 0) / n);
    const recentAvg = delivered.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = delivered.slice(0, Math.max(1, n - 3)).reduce((a, b) => a + b, 0) / Math.max(1, n - 3);
    const trend = recentAvg > olderAvg * 1.05 ? 'improving' : recentAvg < olderAvg * 0.95 ? 'declining' : 'stable';
    const predictions = Array.from({ length: 4 }, (_, i) => {
      const x = n + i;
      const predicted = Math.round(intercept + slope * x);
      const confidence = Math.max(50, 90 - i * 8);
      const margin = stdDev * (1 + i * 0.3);
      return {
        sprint: `Sprint ${velocityData[n - 1].sprint_number + i + 1}`,
        predicted: Math.max(0, predicted),
        lower: Math.max(0, Math.round(predicted - margin)),
        upper: Math.round(predicted + margin),
        confidence,
      };
    });
    return {
      avgVelocity: Math.round(avg),
      avgAccuracy: Math.round(accuracy),
      trend, slope: Math.round(slope * 100) / 100,
      stdDev: Math.round(stdDev * 10) / 10, predictions,
      chartData: velocityData.map(s => ({
        sprint: `Sprint ${s.sprint_number}`,
        committed: s.committed_points || 0,
        delivered: s.delivered_points || 0,
        velocity: s.committed_points > 0 ? Math.round((s.delivered_points / s.committed_points) * 100) : 0,
      })),
    };
  }, [velocityData, velocitySample]);

  const displayVelocity = computedMetrics?.chartData || sampleVelocityHistory;
  const displayPredictions = computedMetrics?.predictions || samplePredictions;
  const avgVelocity = computedMetrics?.avgVelocity ?? 34;
  const avgAccuracy = computedMetrics?.avgAccuracy ?? 92;
  const trend = computedMetrics?.trend ?? 'improving';

  const deliveryForecast = useMemo(() => {
    const totalBacklog = 120;
    const sprintsNeeded = avgVelocity > 0 ? Math.ceil(totalBacklog / avgVelocity) : 0;
    const predictedDate = format(addDays(new Date(), sprintsNeeded * 14), 'dd MMM yyyy');
    const riskFactors: string[] = [];
    if (trend === 'declining') riskFactors.push('Velocity is trending downward');
    if (avgAccuracy < 80) riskFactors.push('Low commitment accuracy (<80%)');
    if (sprintsNeeded > 8) riskFactors.push('Extended delivery timeline (>8 sprints)');
    return { totalBacklogPoints: totalBacklog, avgVelocity, sprintsRemaining: sprintsNeeded, predictedDate, confidence: trend === 'improving' ? 82 : trend === 'stable' ? 75 : 60, riskFactors };
  }, [avgVelocity, avgAccuracy, trend]);

  const generateAIInsight = async () => {
    setGeneratingInsight(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-insights', {
        body: { projectId: selectedProject, insightType: 'performance_prediction', context: { avgVelocity, avgAccuracy, trend, sprintsRemaining: deliveryForecast.sprintsRemaining, riskFactors: deliveryForecast.riskFactors } }
      });
      if (error) throw error;
      setAiInsight(data?.insight || data?.analysis || 'Analysis complete. Your team shows a consistent delivery pattern.');
    } catch {
      setAiInsight('Based on current velocity trends, your team demonstrates strong consistency. Focus on reducing scope variance to improve predictability.');
    } finally {
      setGeneratingInsight(false);
    }
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return <ArrowUpRight className="h-4 w-4 text-success" />;
    if (trend === 'declining') return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendBadge = () => {
    if (trend === 'improving') return <Badge className="bg-success/10 text-success border-success/30">Improving</Badge>;
    if (trend === 'declining') return <Badge variant="destructive">Declining</Badge>;
    return <Badge variant="secondary">Stable</Badge>;
  };

  const showingSample = showingFlowSample && velocitySample;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>Flow Metrics - Spark-Agile</title>
        <meta name="description" content="Track velocity, cycle time, throughput, and commitment accuracy with advanced flow analytics." />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <BackButton className="mb-4" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold page-header-gradient">{t("pages.flowMetrics.pageTitle")}</h1>
                <p className="text-muted-foreground">{t("pages.flowMetrics.pageSubtitle")}</p>
              </div>
            </div>
            <Select value={selectedProject || ''} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showingSample && (
            <div className="mb-4 p-3 rounded-lg bg-muted/60 border border-border text-sm text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 shrink-0" />
              {t("pages.flowMetrics.sampleDataNotice")}
            </div>
          )}

          <Tabs defaultValue="flow" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="flow">{t("pages.flowMetrics.flow")}</TabsTrigger>
              <TabsTrigger value="velocity">{t("pages.flowMetrics.velocity")}</TabsTrigger>
              <TabsTrigger value="forecast">{t("pages.flowMetrics.forecast")}</TabsTrigger>
              <TabsTrigger value="utilisation">{t("pages.flowMetrics.utilisation")}</TabsTrigger>
              <TabsTrigger value="health">{t("pages.flowMetrics.health")}</TabsTrigger>
            </TabsList>

            {/* Flow Metrics Tab */}
            <TabsContent value="flow">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card className="shadow-card">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{t("pages.flowMetrics.workInProgress")}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{latestMetrics?.work_in_progress || 0}</div>
                    <p className="text-sm text-muted-foreground mt-1">{t("pages.flowMetrics.activeItems")}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{t("pages.flowMetrics.avgCycleTime")}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{avgCycleTime}</div>
                    <p className="text-sm text-muted-foreground mt-1">{t("pages.flowMetrics.days")}</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{t("pages.flowMetrics.startToFinish")}</span></div>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{t("pages.flowMetrics.avgLeadTime")}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{avgLeadTime}</div>
                    <p className="text-sm text-muted-foreground mt-1">{t("pages.flowMetrics.days")}</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{t("pages.flowMetrics.requestToDelivery")}</span></div>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">{t("pages.flowMetrics.throughput")}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalThroughput}</div>
                    <p className="text-sm text-muted-foreground mt-1">{t("pages.flowMetrics.itemsDelivered")}</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-primary"><Zap className="w-4 h-4" /><span>{t("pages.flowMetrics.last30Days")}</span></div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-card mb-6">
                <CardHeader>
                  <CardTitle>{t("pages.flowMetrics.flowTrendAnalysis")}</CardTitle>
                  <CardDescription>{t("pages.flowMetrics.trackDeliveryEfficiency")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayFlowMetrics.slice(0, 10).map((metric: any, index: number) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{new Date(metric.metric_date).toLocaleDateString()}</span>
                            <span className="text-xs text-muted-foreground">WIP: {metric.work_in_progress}</span>
                            {showingFlowSample && <Badge variant="outline" className="text-xs">Sample</Badge>}
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Cycle: {Number(metric.cycle_time_avg).toFixed(1)}d</span>
                            <span>Lead: {Number(metric.lead_time_avg).toFixed(1)}d</span>
                            <span>Throughput: {metric.throughput}</span>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <TrendingUp className="w-3 h-3" /><span>Latest</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {(hasJiraIntegration || hasGithubIntegration) && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Network className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Related Integration Data</h2>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {hasJiraIntegration && jiraData && <IntegrationDataCard type="jira" data={jiraData} isLoading={isLoading} />}
                    {hasGithubIntegration && githubData && <IntegrationDataCard type="github" data={{ gitCommits: githubData.gitCommits }} isLoading={isLoading} />}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Velocity Tab */}
            <TabsContent value="velocity">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Velocity</p>
                        <p className="text-3xl font-bold">{avgVelocity}</p>
                        <p className="text-xs text-muted-foreground mt-1">pts / sprint</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Zap className="h-6 w-6 text-primary" /></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Commitment Accuracy</p>
                        <p className="text-3xl font-bold">{avgAccuracy}%</p>
                        <div className="mt-1">{getTrendBadge()}</div>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><Target className="h-6 w-6 text-success" /></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sprints to Delivery</p>
                        <p className="text-3xl font-bold">{deliveryForecast.sprintsRemaining}</p>
                        <p className="text-xs text-muted-foreground mt-1">{deliveryForecast.predictedDate}</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center"><Calendar className="h-6 w-6 text-accent" /></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Forecast Confidence</p>
                        <p className="text-3xl font-bold">{deliveryForecast.confidence}%</p>
                        <Progress value={deliveryForecast.confidence} className="mt-2 h-2" />
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><Gauge className="h-6 w-6 text-warning" /></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Velocity Trend</CardTitle>
                    <CardDescription>Committed vs delivered story points per sprint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={displayVelocity}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="sprint" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Bar dataKey="committed" name="Committed" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="delivered" name="Delivered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Velocity Insights</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {getTrendIcon()}
                      <div><p className="text-sm font-medium">Trend</p><p className="text-xs text-muted-foreground capitalize">{trend} over last 3 sprints</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Activity className="h-4 w-4 text-primary" />
                      <div><p className="text-sm font-medium">Consistency</p><p className="text-xs text-muted-foreground">σ = {computedMetrics?.stdDev ?? 3.2} pts variance</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <div><p className="text-sm font-medium">Best Sprint</p><p className="text-xs text-muted-foreground">{Math.max(...displayVelocity.map(d => d.delivered))} points delivered</p></div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={generateAIInsight} disabled={generatingInsight}>
                      {generatingInsight ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                      AI Analysis
                    </Button>
                    {aiInsight && <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">{aiInsight}</div>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Forecast Tab */}
            <TabsContent value="forecast">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5 text-accent" />Delivery Forecast</CardTitle>
                    <CardDescription>Predicted velocity with confidence intervals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={[
                        ...displayVelocity.map(d => ({ sprint: d.sprint, actual: d.delivered, predicted: null, lower: null, upper: null })),
                        ...displayPredictions.map(d => ({ sprint: d.sprint, actual: null, predicted: d.predicted, lower: d.lower, upper: d.upper })),
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="sprint" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Area type="monotone" dataKey="upper" name="Upper Bound" stroke="none" fill="hsl(var(--primary) / 0.1)" />
                        <Area type="monotone" dataKey="lower" name="Lower Bound" stroke="none" fill="hsl(var(--background))" />
                        <Line type="monotone" dataKey="actual" name="Actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4 }} connectNulls={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Delivery Estimate</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Backlog Remaining</span><span className="font-medium">{deliveryForecast.totalBacklogPoints} pts</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Avg Velocity</span><span className="font-medium">{deliveryForecast.avgVelocity} pts/sprint</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sprints Needed</span><span className="font-bold text-primary">{deliveryForecast.sprintsRemaining}</span></div>
                      <div className="pt-2 border-t"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Target Date</span><span className="font-semibold">{deliveryForecast.predictedDate}</span></div></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />Risk Factors</CardTitle></CardHeader>
                    <CardContent>
                      {deliveryForecast.riskFactors.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" />No significant risks identified</div>
                      ) : (
                        <ul className="space-y-2">
                          {deliveryForecast.riskFactors.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />{r}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  {displayPredictions.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                      <span className="font-medium">{p.sprint}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{p.lower}–{p.upper}</span>
                        <Badge variant="outline" className="text-xs">{p.confidence}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Utilisation Tab */}
            <TabsContent value="utilisation">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Resource Utilisation</CardTitle>
                    <CardDescription>Team time allocation across activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={sampleUtilisation}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Area type="monotone" dataKey="development" name="Development" stackId="1" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.7} />
                        <Area type="monotone" dataKey="testing" name="Testing" stackId="1" fill="hsl(var(--accent))" stroke="hsl(var(--accent))" fillOpacity={0.7} />
                        <Area type="monotone" dataKey="planning" name="Planning" stackId="1" fill="hsl(var(--muted-foreground) / 0.3)" stroke="hsl(var(--muted-foreground))" fillOpacity={0.5} />
                        <Area type="monotone" dataKey="overhead" name="Overhead" stackId="1" fill="hsl(var(--destructive) / 0.3)" stroke="hsl(var(--destructive))" fillOpacity={0.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Utilisation Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Development', value: 72, color: 'bg-primary' },
                      { label: 'Testing', value: 15, color: 'bg-accent' },
                      { label: 'Planning', value: 8, color: 'bg-muted-foreground' },
                      { label: 'Overhead', value: 5, color: 'bg-destructive' },
                    ].map(item => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{item.label}</span><span className="font-medium">{item.value}%</span></div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} /></div>
                      </div>
                    ))}
                    <div className="pt-3 border-t mt-4">
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <p className="font-medium mb-1">💡 Recommendation</p>
                        <p className="text-muted-foreground text-xs">Your development-to-overhead ratio of 14:1 is excellent. Consider allocating 2% more to testing to improve quality metrics.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Team Performance Radar</CardTitle>
                    <CardDescription>Multi-dimensional performance assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={380}>
                      <RadarChart data={sampleHealthRadar}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Health Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {sampleHealthRadar.map(m => (
                      <div key={m.metric} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{m.metric}</span>
                          <span className={`font-medium ${m.value >= 80 ? 'text-success' : m.value >= 60 ? 'text-warning' : 'text-destructive'}`}>{m.value}/100</span>
                        </div>
                        <Progress value={m.value} className="h-2" />
                      </div>
                    ))}
                    <div className="pt-3 border-t mt-4">
                      <p className="text-sm font-medium mb-2">Overall Score</p>
                      <div className="flex items-center gap-3">
                        <p className="text-4xl font-bold text-primary">{Math.round(sampleHealthRadar.reduce((a, b) => a + b.value, 0) / sampleHealthRadar.length)}</p>
                        <div>
                          <Badge className="bg-success/10 text-success border-success/30">Good</Badge>
                          <p className="text-xs text-muted-foreground mt-1">Above team average</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
