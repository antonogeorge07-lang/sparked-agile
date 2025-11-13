import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface EpicHealthScoreProps {
  epicId: string;
  currentHealth?: string;
  lastCheck?: string | null;
  onHealthUpdate?: () => void;
}

export function EpicHealthScore({ epicId, currentHealth = 'on_track', lastCheck, onHealthUpdate }: EpicHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(currentHealth);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(lastCheck);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setHealthScore(currentHealth);
    setLastCheckTime(lastCheck);
  }, [currentHealth, lastCheck]);

  useEffect(() => {
    loadHealthMetrics();
  }, [epicId]);

  const loadHealthMetrics = async () => {
    try {
      // Get epic details and related metrics
      const { data: epicData, error: epicError } = await supabase
        .from('epics')
        .select(`
          *,
          features(id, status, effort_estimate),
          epic_milestones(id, status)
        `)
        .eq('id', epicId)
        .single();

      if (epicError) throw epicError;

      const totalFeatures = epicData.features?.length || 0;
      const completedFeatures = epicData.features?.filter((f: any) => f.status === 'completed').length || 0;
      const completionRate = totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0;

      const missedMilestones = epicData.epic_milestones?.filter((m: any) => m.status === 'missed').length || 0;
      const totalMilestones = epicData.epic_milestones?.length || 0;

      let scheduleStatus = 'On Track';
      let daysRemaining = null;

      if (epicData.start_date && epicData.end_date) {
        const today = new Date();
        const endDate = new Date(epicData.end_date);
        const startDate = new Date(epicData.start_date);
        
        daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const expectedCompletion = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
        const scheduleVariance = completionRate - expectedCompletion;

        if (daysRemaining < 0) {
          scheduleStatus = 'Overdue';
        } else if (scheduleVariance < -20) {
          scheduleStatus = 'Behind Schedule';
        } else if (scheduleVariance < -10) {
          scheduleStatus = 'At Risk';
        }
      }

      setHealthMetrics({
        completionRate: Math.round(completionRate),
        totalFeatures,
        completedFeatures,
        missedMilestones,
        totalMilestones,
        scheduleStatus,
        daysRemaining,
      });
    } catch (error: any) {
      console.error('Error loading health metrics:', error);
    }
  };

  const handleCalculateHealth = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.rpc('calculate_epic_health_score', {
        epic_id_param: epicId
      });

      if (error) throw error;

      setHealthScore(data);
      setLastCheckTime(new Date().toISOString());
      await loadHealthMetrics();
      onHealthUpdate?.();

      toast({
        title: "Health score updated",
        description: `Epic health is ${data.replace('_', ' ')}`,
      });
    } catch (error: any) {
      console.error('Error calculating health:', error);
      toast({
        title: "Error",
        description: "Failed to calculate health score",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getHealthIcon = () => {
    switch (healthScore) {
      case 'on_track':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getHealthColor = () => {
    switch (healthScore) {
      case 'on_track':
        return 'bg-green-500/10 text-green-500 border-green-500';
      case 'at_risk':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground';
    }
  };

  const getHealthBadgeVariant = () => {
    switch (healthScore) {
      case 'critical':
        return 'destructive';
      case 'at_risk':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Epic Health Score</CardTitle>
            <CardDescription>
              AI-powered health assessment based on progress and timeline
            </CardDescription>
          </div>
          <Button 
            onClick={handleCalculateHealth} 
            disabled={isCalculating}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`p-6 border-2 rounded-lg ${getHealthColor()} mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getHealthIcon()}
              <div>
                <h3 className="text-2xl font-bold capitalize">
                  {healthScore.replace('_', ' ')}
                </h3>
                {lastCheckTime && (
                  <p className="text-sm opacity-70">
                    Last checked {format(new Date(lastCheckTime), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={getHealthBadgeVariant()} className="text-lg px-4 py-2">
              {healthScore === 'on_track' ? '✓' : healthScore === 'at_risk' ? '⚠' : '✗'}
            </Badge>
          </div>
        </div>

        {healthMetrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-2xl font-bold">{healthMetrics.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthMetrics.completedFeatures} of {healthMetrics.totalFeatures} features
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Schedule Status</p>
                <p className="text-lg font-semibold">{healthMetrics.scheduleStatus}</p>
                {healthMetrics.daysRemaining !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {healthMetrics.daysRemaining > 0 
                      ? `${healthMetrics.daysRemaining} days remaining`
                      : `${Math.abs(healthMetrics.daysRemaining)} days overdue`
                    }
                  </p>
                )}
              </div>
            </div>

            {healthMetrics.missedMilestones > 0 && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="font-semibold">
                    {healthMetrics.missedMilestones} missed milestone{healthMetrics.missedMilestones > 1 ? 's' : ''}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  of {healthMetrics.totalMilestones} total milestones
                </p>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-semibold mb-2">Health Factors:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Feature completion rate vs. timeline progress</li>
                <li>• Missed and upcoming milestones</li>
                <li>• Days remaining until deadline</li>
                <li>• Schedule variance (ahead/behind)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
