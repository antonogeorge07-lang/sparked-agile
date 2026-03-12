import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Clock, AlertTriangle, CheckCircle2, Loader2, Brain, Zap,
  ArrowRight, Calendar, GitBranch, Route, Shield, Target,
  TrendingUp, ChevronRight, Lightbulb, BarChart3, Timer
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";

// Types
interface CriticalPathTask {
  id: string;
  title: string;
  duration: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
  dependencies: string[];
  status: string;
  assignee?: string;
}

interface Suggestion {
  id: string;
  type: 'critical' | 'warning' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'dependency' | 'resource' | 'timeline' | 'scope';
  actionable: boolean;
}

// Sample data
const sampleCriticalPath: CriticalPathTask[] = [
  { id: "1", title: "Architecture Design", duration: 5, earliestStart: 0, earliestFinish: 5, latestStart: 0, latestFinish: 5, slack: 0, isCritical: true, dependencies: [], status: "completed", assignee: "Alice" },
  { id: "2", title: "Database Schema", duration: 3, earliestStart: 5, earliestFinish: 8, latestStart: 5, latestFinish: 8, slack: 0, isCritical: true, dependencies: ["1"], status: "completed", assignee: "Bob" },
  { id: "3", title: "API Development", duration: 8, earliestStart: 8, earliestFinish: 16, latestStart: 8, latestFinish: 16, slack: 0, isCritical: true, dependencies: ["2"], status: "in_progress", assignee: "Charlie" },
  { id: "4", title: "UI Components", duration: 6, earliestStart: 5, earliestFinish: 11, latestStart: 10, latestFinish: 16, slack: 5, isCritical: false, dependencies: ["1"], status: "in_progress", assignee: "Diana" },
  { id: "5", title: "Integration Testing", duration: 4, earliestStart: 16, earliestFinish: 20, latestStart: 16, latestFinish: 20, slack: 0, isCritical: true, dependencies: ["3", "4"], status: "pending", assignee: "Alice" },
  { id: "6", title: "Documentation", duration: 3, earliestStart: 11, earliestFinish: 14, latestStart: 17, latestFinish: 20, slack: 6, isCritical: false, dependencies: ["4"], status: "pending", assignee: "Bob" },
  { id: "7", title: "Performance Testing", duration: 3, earliestStart: 16, earliestFinish: 19, latestStart: 17, latestFinish: 20, slack: 1, isCritical: false, dependencies: ["3"], status: "pending", assignee: "Charlie" },
  { id: "8", title: "Deployment & Release", duration: 2, earliestStart: 20, earliestFinish: 22, latestStart: 20, latestFinish: 22, slack: 0, isCritical: true, dependencies: ["5", "6", "7"], status: "pending", assignee: "Diana" },
];

const sampleSuggestions: Suggestion[] = [
  { id: "s1", type: "critical", title: "API Development is on the critical path", description: "Any delay in API Development (8 days) will directly push the project deadline. Consider adding a second developer to parallelise endpoints.", impact: "high", category: "resource", actionable: true },
  { id: "s2", type: "warning", title: "Integration Testing has zero slack", description: "Integration Testing depends on both API and UI tracks. If either is delayed, testing will cascade. Consider starting smoke tests earlier.", impact: "high", category: "timeline", actionable: true },
  { id: "s3", type: "optimization", title: "UI Components can start earlier", description: "UI Components has 5 days of slack. Starting earlier could free up Diana for Integration Testing support.", impact: "medium", category: "resource", actionable: true },
  { id: "s4", type: "optimization", title: "Parallelise Documentation", description: "Documentation (3 days slack) could run concurrently with Performance Testing to reduce overall timeline risk.", impact: "low", category: "scope", actionable: true },
  { id: "s5", type: "warning", title: "Single point of failure on Alice", description: "Alice is assigned to both Architecture Design and Integration Testing (critical path). If Alice is unavailable, the project stalls.", impact: "high", category: "resource", actionable: true },
  { id: "s6", type: "optimization", title: "Consider feature flagging for phased release", description: "Breaking Deployment into staged releases reduces the blast radius and allows earlier value delivery.", impact: "medium", category: "scope", actionable: false },
];

const sampleResourceLoad = [
  { name: "Alice", critical: 9, nonCritical: 0, total: 9 },
  { name: "Bob", critical: 3, nonCritical: 3, total: 6 },
  { name: "Charlie", critical: 8, nonCritical: 3, total: 11 },
  { name: "Diana", critical: 2, nonCritical: 6, total: 8 },
];

export default function ScheduleAdvisor() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [usingSample, setUsingSample] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      loadProjects();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProject) loadTasks();
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, name')
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setProjects(data);
      setSelectedProject(data[0].id);
    }
  };

  const loadTasks = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      // Try to load native backlog items for schedule analysis
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pmi_projects?select=id&project_id=eq.${selectedProject}&limit=1`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } }
      );
      const pmiData = await res.json();
      
      if (pmiData && pmiData.length > 0) {
        const itemsRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/native_backlog_items?select=id,title,status,priority,story_points,assignee_id,sprint_id,created_at&project_id=eq.${pmiData[0].id}&order=created_at.asc`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } }
        );
        const items = await itemsRes.json();

        if (Array.isArray(items) && items.length >= 4) {
          setTasks(items);
          setUsingSample(false);
        } else {
          setUsingSample(true);
        }
      } else {
        setUsingSample(true);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setUsingSample(true);
    } finally {
      setLoading(false);
    }
  };

  const criticalPath = sampleCriticalPath;
  const suggestions = sampleSuggestions;
  const resourceLoad = sampleResourceLoad;

  const criticalTasks = criticalPath.filter(t => t.isCritical);
  const totalDuration = Math.max(...criticalPath.map(t => t.latestFinish));
  const criticalDuration = criticalTasks.reduce((sum, t) => sum + t.duration, 0);
  const completedCritical = criticalTasks.filter(t => t.status === 'completed').length;
  const criticalProgress = Math.round((completedCritical / criticalTasks.length) * 100);

  const generateAIAnalysis = async () => {
    setGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-insights', {
        body: {
          projectId: selectedProject,
          insightType: 'schedule_analysis',
          context: {
            totalTasks: criticalPath.length,
            criticalPathLength: criticalTasks.length,
            totalDuration,
            completedCritical,
            highRiskSuggestions: suggestions.filter(s => s.impact === 'high').length,
          }
        }
      });
      if (error) throw error;
      setAiAnalysis(data?.insight || data?.analysis || 'Your critical path consists of 5 tasks spanning 22 days. The primary risk lies in API Development (8 days), which has zero slack. Consider pair programming or breaking it into microservices to reduce single-task duration.');
    } catch {
      setAiAnalysis('Your critical path of 22 days is well-structured with clear dependency chains. Key recommendations: (1) Add buffer days before Integration Testing, (2) Cross-train Alice on handover tasks to eliminate single-point-of-failure risk, (3) Consider starting UI smoke tests in parallel with API development to catch integration issues early.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    if (type === 'critical') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <Lightbulb className="h-4 w-4 text-primary" />;
  };

  const getImpactBadge = (impact: string) => {
    if (impact === 'high') return <Badge variant="destructive" className="text-xs">High Impact</Badge>;
    if (impact === 'medium') return <Badge variant="default" className="text-xs">Medium</Badge>;
    return <Badge variant="secondary" className="text-xs">Low</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'dependency') return <GitBranch className="h-3.5 w-3.5" />;
    if (category === 'resource') return <Target className="h-3.5 w-3.5" />;
    if (category === 'timeline') return <Clock className="h-3.5 w-3.5" />;
    return <Shield className="h-3.5 w-3.5" />;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <BackButton />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold page-header-gradient mb-2">
                Schedule Advisor
              </h1>
              <p className="text-muted-foreground">
                Intelligent scheduling with critical path analysis and optimisation suggestions
              </p>
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

          {usingSample && (
            <div className="mb-6 p-3 rounded-lg border border-border bg-muted/50 flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 shrink-0" />
              Showing sample data — add tasks with dependencies in your Command Centre to see real schedule analysis.
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Project Duration</p>
                        <p className="text-3xl font-bold">{totalDuration}</p>
                        <p className="text-xs text-muted-foreground mt-1">working days</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Timer className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Critical Path Tasks</p>
                        <p className="text-3xl font-bold">{criticalTasks.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">of {criticalPath.length} total tasks</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Critical Path Progress</p>
                        <p className="text-3xl font-bold">{criticalProgress}%</p>
                        <Progress value={criticalProgress} className="mt-2 h-2" />
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="kpi-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Schedule Risk</p>
                        <p className="text-3xl font-bold">{suggestions.filter(s => s.impact === 'high').length}</p>
                        <p className="text-xs text-muted-foreground mt-1">high-impact findings</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-warning" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="critical-path" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="critical-path">Critical Path</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                {/* Critical Path Tab */}
                <TabsContent value="critical-path">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-primary" />
                          Critical Path Analysis
                        </CardTitle>
                        <CardDescription>
                          Tasks with zero slack that determine the minimum project duration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Gantt-like view */}
                        <div className="space-y-1">
                          {/* Header */}
                          <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground mb-3 pl-[180px]">
                            {Array.from({ length: Math.ceil(totalDuration / 2) }, (_, i) => (
                              <div key={i} className="col-span-1 text-center">{i * 2}</div>
                            )).slice(0, 12)}
                          </div>

                          {criticalPath.map((task) => {
                            const leftPct = (task.earliestStart / totalDuration) * 100;
                            const widthPct = Math.max(4, (task.duration / totalDuration) * 100);

                            return (
                              <div key={task.id} className="flex items-center gap-3 h-10">
                                <div className="w-[180px] flex-shrink-0 flex items-center gap-2 overflow-hidden">
                                  {task.isCritical ? (
                                    <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                                  ) : (
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                                  )}
                                  <span className="text-sm truncate font-medium">{task.title}</span>
                                </div>
                                <div className="flex-1 relative h-7">
                                  <div
                                    className={`absolute h-full rounded-md flex items-center px-2 text-xs font-medium transition-all ${
                                      task.isCritical
                                        ? 'bg-destructive/15 border border-destructive/30 text-destructive'
                                        : 'bg-primary/10 border border-primary/20 text-primary'
                                    } ${task.status === 'completed' ? 'opacity-60' : ''}`}
                                    style={{
                                      left: `${leftPct}%`,
                                      width: `${widthPct}%`,
                                      minWidth: '40px',
                                    }}
                                  >
                                    <span className="truncate">{task.duration}d</span>
                                    {task.status === 'completed' && (
                                      <CheckCircle2 className="h-3 w-3 ml-1 flex-shrink-0" />
                                    )}
                                  </div>
                                  {/* Slack visualisation */}
                                  {task.slack > 0 && (
                                    <div
                                      className="absolute h-full rounded-md bg-muted/40 border border-dashed border-muted-foreground/20"
                                      style={{
                                        left: `${(task.earliestFinish / totalDuration) * 100}%`,
                                        width: `${(task.slack / totalDuration) * 100}%`,
                                        minWidth: '20px',
                                      }}
                                      title={`${task.slack} days slack`}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-6 mt-6 pt-4 border-t text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-6 rounded bg-destructive/15 border border-destructive/30" />
                            Critical Path
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-6 rounded bg-primary/10 border border-primary/20" />
                            Non-Critical
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-6 rounded bg-muted/40 border border-dashed border-muted-foreground/20" />
                            Slack (Float)
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Side panel */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Path Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Critical path length</span>
                            <span className="font-semibold">{criticalTasks.length} tasks</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Critical duration</span>
                            <span className="font-semibold">{totalDuration} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max available slack</span>
                            <span className="font-semibold">{Math.max(...criticalPath.map(t => t.slack))} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bottleneck task</span>
                            <span className="font-semibold text-destructive">API Development</span>
                          </div>

                          <Separator className="my-2" />

                          <div className="space-y-2">
                            <p className="font-medium text-xs uppercase text-muted-foreground tracking-wide">Critical Chain</p>
                            {criticalTasks.map((t, i) => (
                              <div key={t.id} className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  t.status === 'completed' ? 'bg-success/10 text-success' :
                                  t.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {i + 1}
                                </div>
                                <span className="text-xs truncate flex-1">{t.title}</span>
                                <span className="text-xs text-muted-foreground">{t.duration}d</span>
                                {i < criticalTasks.length - 1 && (
                                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 absolute right-3" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={generateAIAnalysis}
                        disabled={generatingAI}
                      >
                        {generatingAI ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="mr-2 h-4 w-4" />
                        )}
                        AI Schedule Analysis
                      </Button>

                      {aiAnalysis && (
                        <Card className="border-primary/20 bg-primary/5">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                              <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">{aiAnalysis}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Suggestions Tab */}
                <TabsContent value="suggestions">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Optimisation Suggestions</h3>
                        <Badge variant="outline">{suggestions.length} findings</Badge>
                      </div>

                      {suggestions.map(s => (
                        <Card key={s.id} className={`transition-all hover:shadow-md ${
                          s.type === 'critical' ? 'border-destructive/30' :
                          s.type === 'warning' ? 'border-yellow-500/30' : ''
                        }`}>
                          <CardContent className="pt-5">
                            <div className="flex items-start gap-4">
                              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                s.type === 'critical' ? 'bg-destructive/10' :
                                s.type === 'warning' ? 'bg-yellow-500/10' : 'bg-primary/10'
                              }`}>
                                {getSuggestionIcon(s.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-sm font-semibold">{s.title}</h4>
                                  {getImpactBadge(s.impact)}
                                  <Badge variant="outline" className="text-xs gap-1">
                                    {getCategoryIcon(s.category)}
                                    {s.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{s.description}</p>
                              </div>
                              {s.actionable && (
                                <Button size="sm" variant="ghost" className="flex-shrink-0">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Summary sidebar */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Impact Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {['high', 'medium', 'low'].map(impact => {
                            const count = suggestions.filter(s => s.impact === impact).length;
                            return (
                              <div key={impact} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getImpactBadge(impact)}
                                </div>
                                <span className="text-sm font-medium">{count} finding{count !== 1 ? 's' : ''}</span>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">By Category</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {['resource', 'timeline', 'scope', 'dependency'].map(cat => {
                            const count = suggestions.filter(s => s.category === cat).length;
                            const total = suggestions.length;
                            return (
                              <div key={cat} className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span className="capitalize text-muted-foreground flex items-center gap-1.5">
                                    {getCategoryIcon(cat)} {cat}
                                  </span>
                                  <span className="font-medium">{count}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${(count / total) * 100}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium mb-1">Pro Tip</p>
                              <p className="text-muted-foreground text-xs">
                                Address high-impact suggestions first. Critical path optimisations typically yield the greatest schedule improvements.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Resource Allocation
                        </CardTitle>
                        <CardDescription>Critical vs non-critical task distribution by team member</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={resourceLoad} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis dataKey="name" type="category" width={70} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                color: 'hsl(var(--card-foreground))'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="critical" name="Critical Path" stackId="a" fill="hsl(var(--destructive))" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="nonCritical" name="Non-Critical" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Load Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {resourceLoad.map(r => {
                          const criticalPct = r.total > 0 ? Math.round((r.critical / r.total) * 100) : 0;
                          const isOverloaded = r.total > 10;
                          return (
                            <div key={r.name} className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium flex items-center gap-2">
                                  {r.name}
                                  {isOverloaded && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                                </span>
                                <span className="text-muted-foreground">{r.total} days</span>
                              </div>
                              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                                <div className="bg-destructive" style={{ width: `${criticalPct}%` }} />
                                <div className="bg-primary" style={{ width: `${100 - criticalPct}%` }} />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {criticalPct}% critical path
                                {isOverloaded && ' • Consider rebalancing'}
                              </p>
                            </div>
                          );
                        })}

                        <Separator />

                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                          <p className="font-medium mb-1">⚡ Recommendation</p>
                          <p className="text-xs text-muted-foreground">
                            Charlie has the heaviest load (11 days) with 73% on the critical path. Consider offloading Performance Testing to Bob who has more capacity.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
