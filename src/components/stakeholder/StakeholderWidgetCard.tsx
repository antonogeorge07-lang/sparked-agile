import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  AlertTriangle, 
  LayoutDashboard, 
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StakeholderWidgetCardProps {
  widgetType: string;
  projectId: string | null;
  config?: Record<string, unknown>;
}

export function StakeholderWidgetCard({ widgetType, projectId, config }: StakeholderWidgetCardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadWidgetData();
    }
  }, [widgetType, projectId]);

  const loadWidgetData = async () => {
    setLoading(true);
    
    try {
      switch (widgetType) {
        case 'velocity_trend':
          await loadVelocityData();
          break;
        case 'epic_roi':
          await loadEpicROIData();
          break;
        case 'milestone_tracker':
          await loadMilestoneData();
          break;
      case 'risk_heatmap':
        // Risk data - set empty for now as table may not exist
        setData({ risks: [] });
        break;
      case 'sprint_progress':
        await loadSprintProgress();
        break;
      case 'team_velocity':
        await loadTeamVelocity();
        break;
      case 'blockers_summary':
          await loadBlockers();
          break;
        case 'completion_rate':
          await loadCompletionRate();
          break;
        default:
          setData(null);
      }
    } catch (error) {
      console.error('Error loading widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVelocityData = async () => {
    // Get sprint velocity data
    const { data: sprints } = await supabase
      .from('native_sprints')
      .select('name, velocity_committed, velocity_completed')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5);

    setData({
      sprints: sprints || [],
      trend: sprints && sprints.length > 1 
        ? (sprints[0]?.velocity_completed || 0) - (sprints[1]?.velocity_completed || 0)
        : 0
    });
  };

  const loadEpicROIData = async () => {
    const { data: epics } = await supabase
      .from('epic_roi_tracking')
      .select('epic_id, investment_amount, returns_amount, roi_percentage, epics(title)')
      .order('roi_percentage', { ascending: false })
      .limit(5);

    setData({ epics: epics || [] });
  };

  const loadMilestoneData = async () => {
    const { data: milestones } = await supabase
      .from('epic_milestones')
      .select('title, target_date, status, completion_percentage')
      .gte('target_date', new Date().toISOString())
      .order('target_date')
      .limit(5);

    setData({ milestones: milestones || [] });
  };

  const loadSprintProgress = async () => {
    const { data: sprint } = await supabase
      .from('native_sprints')
      .select('name, velocity_committed, velocity_completed, status')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .maybeSingle();

    if (sprint) {
      const progress = sprint.velocity_committed > 0 
        ? Math.round((sprint.velocity_completed || 0) / sprint.velocity_committed * 100)
        : 0;
      setData({ sprint, progress });
    } else {
      setData({ sprint: null, progress: 0 });
    }
  };

  const loadTeamVelocity = async () => {
    const { data: sprints } = await supabase
      .from('native_sprints')
      .select('velocity_completed')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(6);

    const velocities = sprints?.map(s => s.velocity_completed || 0) || [];
    const average = velocities.length > 0 
      ? Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length)
      : 0;

    setData({ velocities, average });
  };

  const loadBlockers = async () => {
    const { data: items, count } = await supabase
      .from('native_backlog_items')
      .select('title, priority', { count: 'exact' })
      .eq('project_id', projectId)
      .eq('status', 'blocked')
      .limit(5);

    setData({ blockers: items || [], count: count || 0 });
  };

  const loadCompletionRate = async () => {
    const { count: total } = await supabase
      .from('native_backlog_items')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const { count: completed } = await supabase
      .from('native_backlog_items')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'done');

    const rate = total && total > 0 ? Math.round(((completed || 0) / total) * 100) : 0;
    setData({ total: total || 0, completed: completed || 0, rate });
  };

  const renderWidgetContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-full w-3/4" />
          <div className="h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/2" />
        </div>
      );
    }

    if (!data) {
      return (
        <p className="text-muted-foreground text-sm italic">No data available</p>
      );
    }

    switch (widgetType) {
      case 'velocity_trend':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {data.sprints[0]?.velocity_completed || 0}
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">pts</span>
                <span className="text-xs text-muted-foreground">last sprint</span>
              </div>
              {data.trend !== 0 && (
                <Badge 
                  variant={data.trend > 0 ? "default" : "destructive"} 
                  className={`ml-auto shadow-sm ${data.trend > 0 ? 'bg-emerald-500/90 hover:bg-emerald-500' : ''}`}
                >
                  {data.trend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(data.trend)} pts
                </Badge>
              )}
            </div>
            <div className="space-y-2 pt-2 border-t border-border/50">
              {data.sprints.slice(0, 3).map((s: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate">{s.name}</span>
                  <span className="font-medium tabular-nums">{s.velocity_completed || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'epic_roi':
        return (
          <div className="space-y-3">
            {data.epics.length === 0 ? (
              <p className="text-muted-foreground text-sm italic text-center py-4">No ROI data tracked</p>
            ) : (
              data.epics.slice(0, 3).map((epic: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/30 hover:border-primary/20 transition-colors">
                  <span className="text-sm truncate flex-1 font-medium">{epic.epics?.title || 'Untitled'}</span>
                  <Badge 
                    variant={epic.roi_percentage > 0 ? "default" : "destructive"}
                    className={`ml-2 ${epic.roi_percentage > 0 ? 'bg-primary/90' : ''}`}
                  >
                    {epic.roi_percentage?.toFixed(0) || 0}%
                  </Badge>
                </div>
              ))
            )}
          </div>
        );

      case 'milestone_tracker':
        return (
          <div className="space-y-4">
            {data.milestones.length === 0 ? (
              <p className="text-muted-foreground text-sm italic text-center py-4">No upcoming milestones</p>
            ) : (
              data.milestones.slice(0, 3).map((m: any, i: number) => (
                <div key={i} className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{m.title}</span>
                    <Badge variant={m.status === 'completed' ? 'default' : 'outline'} className="text-xs shrink-0">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={m.completion_percentage || 0} className="h-1.5 flex-1 bg-muted/50" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(m.target_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'risk_heatmap':
        return (
          <div className="space-y-3">
            {data.risks.length === 0 ? (
              <div className="text-center py-6 bg-gradient-to-br from-primary/5 to-transparent rounded-xl">
                <CheckCircle2 className="h-10 w-10 mx-auto text-primary/70 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">No active risks</p>
              </div>
            ) : (
              data.risks.slice(0, 3).map((risk: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30 hover:border-border/50 transition-colors">
                  <div 
                    className={`w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-background ${
                      risk.impact === 'high' ? 'bg-destructive ring-destructive/30' : 
                      risk.impact === 'medium' ? 'bg-primary ring-primary/30' : 'bg-primary/50 ring-primary/20'
                    }`}
                  />
                  <span className="text-sm truncate flex-1">{risk.title}</span>
                  <Badge variant="outline" className="text-xs">{risk.status}</Badge>
                </div>
              ))
            )}
          </div>
        );

      case 'sprint_progress':
        return (
          <div className="space-y-4">
            {data.sprint ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{data.sprint.name}</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {data.progress}%
                  </span>
                </div>
                <div className="relative">
                  <Progress value={data.progress} className="h-3 bg-muted/50" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>{data.sprint.velocity_completed || 0} completed</span>
                  <span>{data.sprint.velocity_committed || 0} committed</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm italic text-center py-4">No active sprint</p>
            )}
          </div>
        );

      case 'team_velocity':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {data.average}
              </span>
              <span className="text-sm text-muted-foreground ml-2">avg pts/sprint</span>
            </div>
            <div className="flex items-end justify-center gap-1.5 h-20 pt-2">
              {data.velocities.reverse().map((v: number, i: number) => (
                <div 
                  key={i}
                  className="w-7 bg-gradient-to-t from-primary to-primary/70 rounded-t-md transition-all hover:from-primary hover:to-primary/90"
                  style={{ height: `${Math.max(15, (v / Math.max(...data.velocities, 1)) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        );

      case 'blockers_summary':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${data.count > 0 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                <AlertTriangle className={`h-5 w-5 ${data.count > 0 ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div>
                <span className="text-3xl font-bold">{data.count}</span>
                <span className="text-sm text-muted-foreground ml-2">active blockers</span>
              </div>
            </div>
            {data.blockers.slice(0, 2).map((b: any, i: number) => (
              <div key={i} className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl text-sm flex items-center gap-2">
                <Badge variant="destructive" className="text-xs shrink-0">{b.priority}</Badge>
                <span className="truncate">{b.title}</span>
              </div>
            ))}
          </div>
        );

      case 'completion_rate':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {data.rate}%
              </span>
            </div>
            <div className="relative">
              <Progress value={data.rate} className="h-3 bg-muted/50" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {data.completed} completed
              </span>
              <span>{data.total} total items</span>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground text-sm">Unknown widget type</p>;
    }
  };

  const getWidgetInfo = () => {
    const icons: Record<string, React.ComponentType<any>> = {
      velocity_trend: TrendingUp,
      epic_roi: Target,
      milestone_tracker: Calendar,
      risk_heatmap: AlertTriangle,
      sprint_progress: LayoutDashboard,
      team_velocity: TrendingUp,
      blockers_summary: AlertTriangle,
      completion_rate: CheckCircle2,
    };

    const titles: Record<string, string> = {
      velocity_trend: 'Velocity Trend',
      epic_roi: 'Epic ROI',
      milestone_tracker: 'Milestones',
      risk_heatmap: 'Risk Overview',
      sprint_progress: 'Sprint Progress',
      team_velocity: 'Team Velocity',
      blockers_summary: 'Blockers',
      completion_rate: 'Completion Rate',
    };

    return {
      Icon: icons[widgetType] || LayoutDashboard,
      title: titles[widgetType] || widgetType
    };
  };

  const { Icon, title } = getWidgetInfo();

  return (
    <div className="pt-2">
      <CardHeader className="pb-3 pl-12 pr-12">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-12 pr-4 pb-5">
        {renderWidgetContent()}
      </CardContent>
    </div>
  );
}