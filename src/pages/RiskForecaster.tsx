import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import {
  ShieldAlert, AlertTriangle, TrendingUp, Brain, RefreshCw,
  ChevronRight, Clock, Target, Zap, BarChart3, Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
import { Helmet } from "react-helmet-async";
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, Cell
} from "recharts";

interface RiskItem {
  id: string;
  title: string;
  category: string;
  probability: number;
  impact: number;
  riskScore: number;
  trend: "rising" | "stable" | "declining";
  earlyWarnings: string[];
  mitigations: string[];
  status: "active" | "mitigated" | "escalated";
  detectedAt: string;
}

interface EarlyWarning {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  riskCategory: string;
  detectedAt: string;
  confidence: number;
  suggestedAction: string;
}

const RISK_CATEGORIES = ["Schedule", "Resource", "Technical", "Scope", "Quality", "External"];

const SAMPLE_RISKS: RiskItem[] = [
  {
    id: "r1", title: "Sprint velocity declining 3 consecutive sprints",
    category: "Schedule", probability: 0.78, impact: 0.85, riskScore: 66,
    trend: "rising", status: "active", detectedAt: "2 days ago",
    earlyWarnings: ["Velocity dropped 15% last sprint", "3 stories carried over"],
    mitigations: ["Reduce sprint scope by 20%", "Address tech debt backlog"]
  },
  {
    id: "r2", title: "Key developer leaving in 4 weeks",
    category: "Resource", probability: 0.92, impact: 0.70, riskScore: 64,
    trend: "stable", status: "escalated", detectedAt: "1 week ago",
    earlyWarnings: ["Knowledge concentrated in single developer", "No documented handover plan"],
    mitigations: ["Begin knowledge transfer sessions", "Document critical systems"]
  },
  {
    id: "r3", title: "Third-party API deprecation deadline approaching",
    category: "Technical", probability: 0.65, impact: 0.90, riskScore: 59,
    trend: "rising", status: "active", detectedAt: "3 days ago",
    earlyWarnings: ["API v2 sunset date in 6 weeks", "Migration not yet started"],
    mitigations: ["Prioritise API migration story", "Create fallback adapter pattern"]
  },
  {
    id: "r4", title: "Scope creep from stakeholder requests",
    category: "Scope", probability: 0.55, impact: 0.60, riskScore: 33,
    trend: "declining", status: "mitigated", detectedAt: "2 weeks ago",
    earlyWarnings: ["4 new requirements added mid-sprint", "Backlog grew 30% in 2 weeks"],
    mitigations: ["Enforce change request process", "Weekly stakeholder alignment"]
  },
  {
    id: "r5", title: "Test coverage below threshold",
    category: "Quality", probability: 0.45, impact: 0.75, riskScore: 34,
    trend: "stable", status: "active", detectedAt: "5 days ago",
    earlyWarnings: ["Coverage dropped to 72%", "2 critical bugs in production"],
    mitigations: ["Dedicate 20% capacity to testing", "Implement automated regression suite"]
  },
  {
    id: "r6", title: "Vendor contract renewal uncertainty",
    category: "External", probability: 0.40, impact: 0.65, riskScore: 26,
    trend: "declining", status: "active", detectedAt: "1 week ago",
    earlyWarnings: ["Contract expires in 8 weeks", "Alternative vendor evaluation incomplete"],
    mitigations: ["Accelerate vendor evaluation", "Prepare contingency plan"]
  }
];

const SAMPLE_WARNINGS: EarlyWarning[] = [
  { id: "w1", message: "Sprint burndown deviating significantly from ideal line", severity: "critical", riskCategory: "Schedule", detectedAt: "2 hours ago", confidence: 0.89, suggestedAction: "Review remaining stories and consider scope reduction" },
  { id: "w2", message: "Team utilisation exceeding 95% for 2 consecutive weeks", severity: "warning", riskCategory: "Resource", detectedAt: "6 hours ago", confidence: 0.82, suggestedAction: "Redistribute workload or defer non-critical items" },
  { id: "w3", message: "Increasing cycle time trend detected across last 5 stories", severity: "warning", riskCategory: "Quality", detectedAt: "1 day ago", confidence: 0.75, suggestedAction: "Investigate bottlenecks in code review and testing stages" },
  { id: "w4", message: "Dependency on blocked external team not resolved", severity: "critical", riskCategory: "External", detectedAt: "3 hours ago", confidence: 0.91, suggestedAction: "Escalate to programme level and explore alternative approaches" },
  { id: "w5", message: "New regulatory requirement may impact current sprint scope", severity: "info", riskCategory: "Scope", detectedAt: "12 hours ago", confidence: 0.60, suggestedAction: "Schedule impact assessment meeting with compliance team" }
];

function getRiskColor(score: number) {
  if (score >= 60) return "hsl(var(--destructive))";
  if (score >= 35) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

function getSeverityVariant(severity: string): "destructive" | "secondary" | "outline" {
  if (severity === "critical") return "destructive";
  if (severity === "warning") return "secondary";
  return "outline";
}

function getTrendIcon(trend: string) {
  if (trend === "rising") return <TrendingUp className="h-3 w-3 text-destructive" />;
  if (trend === "declining") return <TrendingUp className="h-3 w-3 text-chart-2 rotate-180" />;
  return <ChevronRight className="h-3 w-3 text-muted-foreground" />;
}

export default function RiskForecaster() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [risks, setRisks] = useState<RiskItem[]>(SAMPLE_RISKS);
  const [warnings, setWarnings] = useState<EarlyWarning[]>(SAMPLE_WARNINGS);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [usingSample, setUsingSample] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data } = await supabase
        .from("pmi_projects")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProjects(data || []);
      if (data && data.length > 0) setSelectedProject(data[0].id);
    } catch { navigate("/auth"); }
    finally { setLoading(false); }
  };

  const runAiAnalysis = useCallback(async () => {
    if (!selectedProject) return;
    setIsAnalysing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-project-insights", {
        body: { projectId: selectedProject, includeRisks: true }
      });
      if (error) throw error;
      if (data?.insights) {
        setAiAnalysis(data.insights.summary || "Analysis complete. Review the risk register for detailed findings.");
        toast.success("AI risk analysis complete");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to run AI analysis");
    } finally { setIsAnalysing(false); }
  }, [selectedProject]);

  // Derived data
  const radarData = RISK_CATEGORIES.map(cat => {
    const catRisks = risks.filter(r => r.category === cat);
    const avgScore = catRisks.length > 0
      ? Math.round(catRisks.reduce((sum, r) => sum + r.riskScore, 0) / catRisks.length)
      : 0;
    return { category: cat, score: avgScore, fullMark: 100 };
  });

  const probabilityData = risks
    .sort((a, b) => b.riskScore - a.riskScore)
    .map(r => ({
      name: r.title.length > 30 ? r.title.slice(0, 30) + "…" : r.title,
      probability: Math.round(r.probability * 100),
      impact: Math.round(r.impact * 100),
      riskScore: r.riskScore
    }));

  const trendData = [
    { week: "W-4", schedule: 45, resource: 30, technical: 25, quality: 20 },
    { week: "W-3", schedule: 50, resource: 35, technical: 30, quality: 28 },
    { week: "W-2", schedule: 55, resource: 40, technical: 45, quality: 32 },
    { week: "W-1", schedule: 60, resource: 55, technical: 50, quality: 34 },
    { week: "Now", schedule: 66, resource: 64, technical: 59, quality: 34 }
  ];

  const activeRisks = risks.filter(r => r.status === "active").length;
  const escalatedRisks = risks.filter(r => r.status === "escalated").length;
  const criticalWarnings = warnings.filter(w => w.severity === "critical").length;
  const overallRiskScore = risks.length > 0
    ? Math.round(risks.reduce((s, r) => s + r.riskScore, 0) / risks.length)
    : 0;

  if (loading) return <LoadingState message="Loading Risk Forecaster..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>Risk Forecaster - SAAI</title>
        <meta name="description" content="Predict and mitigate project risks with AI-powered risk analysis and forecasting." />
      </Helmet>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Risk Forecaster
            </h1>
            <p className="text-muted-foreground">
              Proactive risk identification & mitigation powered by AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={runAiAnalysis} disabled={isAnalysing || !selectedProject}>
              {isAnalysing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Analyse Risks
            </Button>
          </div>
        </div>

        {usingSample && (
          <div className="mb-6 p-3 rounded-lg border border-border bg-muted/50 flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Showing sample data. Create project tasks to see real risk analysis.
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard icon={ShieldAlert} label="Overall Risk" value={`${overallRiskScore}%`}
            color={overallRiskScore >= 60 ? "text-destructive" : overallRiskScore >= 35 ? "text-chart-4" : "text-chart-2"} />
          <SummaryCard icon={AlertTriangle} label="Active Risks" value={String(activeRisks)} color="text-chart-4" />
          <SummaryCard icon={Zap} label="Escalated" value={String(escalatedRisks)} color="text-destructive" />
          <SummaryCard icon={Target} label="Critical Warnings" value={String(criticalWarnings)} color="text-destructive" />
        </div>

        {/* AI Analysis Banner */}
        {aiAnalysis && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">AI Risk Analysis</p>
                <p className="text-sm text-muted-foreground">{aiAnalysis}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="probability" className="space-y-6">
          <TabsList>
            <TabsTrigger value="probability" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Risk Probability
            </TabsTrigger>
            <TabsTrigger value="warnings" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Early Warnings
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              Risk Register
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Risk Trends
            </TabsTrigger>
          </TabsList>

          {/* Risk Probability Tab */}
          <TabsContent value="probability">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Probability × Impact Matrix</CardTitle>
                  <CardDescription>Ranked by composite risk score</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={probabilityData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      />
                      <Legend />
                      <Bar dataKey="probability" name="Probability %" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="impact" name="Impact %" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Profile by Category</CardTitle>
                  <CardDescription>Average risk score per category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid className="opacity-30" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Risk Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Early Warnings Tab */}
          <TabsContent value="warnings">
            <div className="space-y-4">
              {warnings.map(w => (
                <Card key={w.id} className={`border-l-4 ${
                  w.severity === "critical" ? "border-l-destructive" :
                  w.severity === "warning" ? "border-l-chart-4" : "border-l-primary"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityVariant(w.severity)}>
                            {w.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{w.riskCategory}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {w.detectedAt}
                          </span>
                        </div>
                        <p className="font-medium text-sm mb-2">{w.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(w.confidence * 100)}%</span>
                          <Progress value={w.confidence * 100} className="w-20 h-1.5" />
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 max-w-xs">
                        <p className="text-xs font-medium mb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-primary" /> Suggested Action
                        </p>
                        <p className="text-xs text-muted-foreground">{w.suggestedAction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Risk Register Tab */}
          <TabsContent value="register">
            <div className="space-y-4">
              {risks.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={r.status === "escalated" ? "destructive" : r.status === "mitigated" ? "secondary" : "outline"}>
                            {r.status}
                          </Badge>
                          <Badge variant="outline">{r.category}</Badge>
                          <span className="flex items-center gap-1 text-xs">
                            {getTrendIcon(r.trend)} {r.trend}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Detected {r.detectedAt}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-3">{r.title}</h4>

                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Probability</p>
                            <div className="flex items-center gap-2">
                              <Progress value={r.probability * 100} className="h-2 flex-1" />
                              <span className="font-mono">{Math.round(r.probability * 100)}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Impact</p>
                            <div className="flex items-center gap-2">
                              <Progress value={r.impact * 100} className="h-2 flex-1" />
                              <span className="font-mono">{Math.round(r.impact * 100)}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Risk Score</p>
                            <span className="font-mono text-base font-bold" style={{ color: getRiskColor(r.riskScore) }}>
                              {r.riskScore}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">⚠ Early Warnings</p>
                            <ul className="text-xs space-y-1">
                              {r.earlyWarnings.map((w, i) => (
                                <li key={i} className="text-muted-foreground">• {w}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">🛡 Mitigations</p>
                            <ul className="text-xs space-y-1">
                              {r.mitigations.map((m, i) => (
                                <li key={i} className="text-muted-foreground">• {m}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Risk Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Score Trends</CardTitle>
                <CardDescription>Weekly risk score progression by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="schedule" name="Schedule" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="resource" name="Resource" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="technical" name="Technical" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="quality" name="Quality" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
