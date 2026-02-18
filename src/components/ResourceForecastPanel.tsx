import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResourceForecast, SprintForecast, ResourceRecommendation } from "@/hooks/useResourceForecast";
import { TrendingUp, Loader2, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

interface ResourceForecastPanelProps {
  projectId: string | null;
}

const riskColors: Record<string, string> = {
  low: "text-green-500",
  medium: "text-orange-500",
  high: "text-destructive",
};

const impactBadge: Record<string, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

export function ResourceForecastPanel({ projectId }: ResourceForecastPanelProps) {
  const { isForecasting, forecast, generateForecast } = useResourceForecast();
  const [sprintsAhead, setSprintsAhead] = useState("3");
  const [forecastType, setForecastType] = useState("capacity");

  const handleGenerate = () => {
    if (!projectId) return;
    generateForecast({
      projectId,
      sprintsAhead: parseInt(sprintsAhead),
      forecastType,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Predictive Resource Planning
          </CardTitle>
          <CardDescription>
            AI forecasts capacity needs and recommends optimal resource allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sprints Ahead</Label>
              <Select value={sprintsAhead} onValueChange={setSprintsAhead}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} sprint{n > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Forecast Type</Label>
              <Select value={forecastType} onValueChange={setForecastType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="capacity">Capacity</SelectItem>
                  <SelectItem value="allocation">Allocation</SelectItem>
                  <SelectItem value="burndown">Burndown</SelectItem>
                  <SelectItem value="staffing">Staffing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isForecasting || !projectId} className="w-full">
            {isForecasting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Forecasting...</>
            ) : (
              <><BarChart3 className="mr-2 h-4 w-4" />Generate Forecast</>
            )}
          </Button>
        </CardContent>
      </Card>

      {forecast && (
        <>
          {/* Confidence & Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Forecast Analysis</CardTitle>
                <Badge variant={forecast.confidence === 'high' ? 'default' : forecast.confidence === 'medium' ? 'secondary' : 'destructive'}>
                  {forecast.confidence} confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{forecast.analysis}</p>
              {forecast.backlog_completion_estimate && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Backlog Completion: {forecast.backlog_completion_estimate}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sprint Forecasts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sprint-by-Sprint Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast.sprint_forecasts.map((sf, i) => (
                  <div key={i} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Sprint {sf.sprint_number}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{sf.predicted_velocity} pts</Badge>
                        <span className={`text-xs font-medium ${riskColors[sf.risk_level]}`}>
                          {sf.risk_level} risk
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Capacity Utilisation</span>
                        <span>{sf.capacity_utilisation}%</span>
                      </div>
                      <Progress value={sf.capacity_utilisation} className="h-2" />
                    </div>
                    {sf.notes && <p className="text-xs text-muted-foreground">{sf.notes}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {forecast.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[250px]">
                  <div className="space-y-2">
                    {forecast.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 border rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">{r.recommendation}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={impactBadge[r.impact]} className="text-xs">{r.impact} impact</Badge>
                            <Badge variant="outline" className="text-xs">{r.category}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
