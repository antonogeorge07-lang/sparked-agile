import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GitBranch, ArrowRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function EpicDashboardWidget() {
  const [epics, setEpics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEpicSummary();
  }, []);

  const loadEpicSummary = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('epics')
        .select(`
          id, title, status, health_score, priority, business_value, color_hex,
          features(id, status)
        `)
        .in('status', ['in_progress', 'planning'])
        .order('priority', { ascending: true })
        .limit(5);

      setEpics(data || []);
    } catch (e) {
      console.error('Error loading epic summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    if (health === 'critical') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (health === 'at_risk') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const totalActive = epics.length;
  const criticalCount = epics.filter(e => e.health_score === 'critical').length;
  const atRiskCount = epics.filter(e => e.health_score === 'at_risk').length;

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-8 text-center text-muted-foreground">Loading epics...</CardContent>
      </Card>
    );
  }

  if (epics.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Epic Health Overview</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/epic-management')} className="gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <CardDescription className="flex gap-3 text-xs">
          <span>{totalActive} active</span>
          {criticalCount > 0 && <span className="text-red-500">{criticalCount} critical</span>}
          {atRiskCount > 0 && <span className="text-yellow-500">{atRiskCount} at risk</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {epics.map(epic => {
          const total = epic.features?.length || 0;
          const completed = epic.features?.filter((f: any) => f.status === 'completed').length || 0;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={epic.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/epic/${epic.id}`)}
            >
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: epic.color_hex || 'hsl(var(--primary))' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium truncate">{epic.title}</span>
                  {getHealthIcon(epic.health_score)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
