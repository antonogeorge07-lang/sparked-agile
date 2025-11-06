import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIInsightsProps {
  projectId: string | null;
  projectName: string;
  taskCount: number;
}

export function AIInsights({ projectId, projectName, taskCount }: AIInsightsProps) {
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
            Select a project to view AI-powered insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Summary */}
        <div className="p-3 rounded-lg bg-card/50 border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Project Summary</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">{projectName}</span> has {taskCount} active tasks across 5 PMI stages.
          </p>
        </div>

        {/* Next Action Suggestion */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold">Next Action</h4>
            <Badge variant="secondary" className="text-xs ml-auto">AI</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Focus on tasks in the <span className="font-semibold text-foreground">Execution</span> stage to maintain project momentum.
          </p>
        </div>

        {/* Risk Prediction */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold">Risk Analysis</h4>
            <Badge variant="secondary" className="text-xs ml-auto">AI</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Project health is <span className="font-semibold text-emerald-500">good</span>. Monitor overdue tasks to prevent bottlenecks.
          </p>
        </div>

        {/* Future Enhancement Badge */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center italic">
            More AI features coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
