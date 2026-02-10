import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Target,
  Lightbulb,
  Shield,
  Brain
} from "lucide-react";
import { useProjectInsights, ProjectInsights, ProjectMetrics } from "@/hooks/useProjectInsights";
import { AgentDebatePanel } from "./AgentDebatePanel";
import { formatDistanceToNow } from "date-fns";

interface AIInsightsPanelProps {
  projectId: string | null;
  projectName: string;
}

function RiskIndicator({ level, score }: { level: string; score: number }) {
  const colors = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${colors[level as keyof typeof colors] || colors.medium}`} />
      <div className="flex-1">
        <Progress value={score} className="h-2" />
      </div>
      <span className="text-sm font-medium">{score}%</span>
    </div>
  );
}

function VelocityTrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function HealthBadge({ status }: { status: string }) {
  const styles = {
    healthy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'at-risk': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const icons = {
    healthy: <CheckCircle className="h-3 w-3" />,
    'at-risk': <AlertTriangle className="h-3 w-3" />,
    critical: <AlertTriangle className="h-3 w-3" />
  };

  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.healthy}>
      {icons[status as keyof typeof icons]}
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function AIInsightsPanel({ projectId, projectName }: AIInsightsPanelProps) {
  const { insights, isLoading, error, generateInsights, lastGeneratedAt } = useProjectInsights();

  if (!projectId) {
    return (
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a project to generate AI-powered insights
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleGenerate = () => {
    generateInsights(projectId);
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              AI Intelligence
            </CardTitle>
            <CardDescription>
              {projectName && `Analyzing ${projectName}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights" className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="debate" className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              Agent Debate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {insights ? 'Refresh' : 'Generate'}
              </Button>
            </div>

            {isLoading ? (
              <InsightsSkeleton />
            ) : error ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            ) : insights ? (
              <>
                {/* Summary */}
                <div className="p-4 rounded-lg bg-card border">
                  <p className="text-sm">{insights.insights.summary}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lastGeneratedAt && (
                      <span>Generated {formatDistanceToNow(new Date(lastGeneratedAt))} ago</span>
                    )}
                  </div>
                </div>

                {/* Health & Risk */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-card border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Health Status</span>
                      <HealthBadge status={insights.insights.healthStatus} />
                    </div>
                    <div className="flex items-center gap-2">
                      <VelocityTrendIcon trend={insights.insights.velocityTrend} />
                      <span className="text-xs capitalize">{insights.insights.velocityTrend} velocity</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-card border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Risk Level</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {insights.insights.riskLevel}
                      </Badge>
                    </div>
                    <RiskIndicator 
                      level={insights.insights.riskLevel} 
                      score={insights.insights.riskScore} 
                    />
                  </div>
                </div>

                {/* Completion ETA */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Completion Estimate</h4>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {insights.insights.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">{insights.insights.completionEta}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{insights.insights.sprintsRemaining} sprints remaining
                  </p>
                </div>

                {/* Risk Factors */}
                {insights.insights.riskFactors.length > 0 && (
                  <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-destructive" />
                      <h4 className="text-sm font-semibold">Risk Factors</h4>
                    </div>
                    <ul className="space-y-1">
                      {insights.insights.riskFactors.map((factor, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">AI Recommendations</h4>
                  </div>
                  <ul className="space-y-2">
                    {insights.insights.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                  <div className="text-center p-2">
                    <p className="text-lg font-bold">{insights.metrics.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-lg font-bold text-primary">
                      {insights.metrics.completedTasks}
                    </p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-lg font-bold text-destructive">
                      {insights.metrics.overdueTasks}
                    </p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-lg font-bold">{insights.metrics.avgVelocity}</p>
                    <p className="text-xs text-muted-foreground">Velocity</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Generate AI-powered insights including risk prediction and completion estimates
                </p>
                <Button onClick={handleGenerate} size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="debate" className="mt-4">
            {projectId ? (
              <AgentDebatePanel projectId={projectId} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a project to start an agent debate
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
