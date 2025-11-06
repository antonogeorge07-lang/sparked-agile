import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Calendar, AlertTriangle, Sparkles } from "lucide-react";

export function AIInsightPlaceholders() {
  return (
    <div className="grid gap-4">
      {/* Performance Predictor */}
      <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Performance Predictor
            </CardTitle>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Predictive analytics for project velocity, resource utilization, and delivery forecasting.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Velocity Trend</p>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Completion ETA</p>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Advisor */}
      <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Schedule Advisor
            </CardTitle>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Intelligent scheduling recommendations based on task dependencies, resource availability, and historical patterns.
          </p>
          <div className="space-y-2 pt-2">
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Critical Path Analysis</p>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Optimization Suggestions</p>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Forecaster */}
      <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Risk Forecaster
            </CardTitle>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Proactive risk identification and mitigation recommendations powered by machine learning.
          </p>
          <div className="space-y-2 pt-2">
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Risk Probability</p>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Early Warnings</p>
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}