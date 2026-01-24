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

  const loadRiskData = async () => {
    const { data: risks } = await supabase
      .from('project_risks')
      .select('title, probability, impact, status')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5);

    setData({ risks: risks || [] });
  };

  const loadSprintProgress = async () => {
    const { data: sprint } = await supabase
      .from('native_sprints')
      .select('name, velocity_committed, velocity_completed, status')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .single();

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
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-8 bg-muted rounded w-1/2" />
        </div>
      );
    }

    if (!data) {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    switch (widgetType) {
      case 'velocity_trend':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                {data.sprints[0]?.velocity_completed || 0}
              </span>
              <span className="text-sm text-muted-foreground">pts last sprint</span>
              {data.trend !== 0 && (
                <Badge variant={data.trend > 0 ? "default" : "destructive"} className="ml-auto">
                  {data.trend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(data.trend)} pts
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-xs">
              {data.sprints.slice(0, 3).map((s: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span>{s.velocity_completed || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'epic_roi':
        return (
          <div className="space-y-2">
            {data.epics.length === 0 ? (
              <p className="text-muted-foreground text-sm">No ROI data tracked</p>
            ) : (
              data.epics.slice(0, 3).map((epic: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm truncate flex-1">{epic.epics?.title || 'Untitled'}</span>
                  <Badge variant={epic.roi_percentage > 0 ? "default" : "destructive"}>
                    {epic.roi_percentage?.toFixed(0) || 0}%
                  </Badge>
                </div>
              ))
            )}
          </div>
        );

      case 'milestone_tracker':
        return (
          <div className="space-y-2">
            {data.milestones.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming milestones</p>
            ) : (
              data.milestones.slice(0, 3).map((m: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{m.title}</span>
                    <Badge variant={m.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={m.completion_percentage || 0} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">
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
          <div className="space-y-2">
            {data.risks.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">No active risks</p>
              </div>
            ) : (
              data.risks.slice(0, 3).map((risk: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      risk.impact === 'high' ? 'bg-red-500' : 
                      risk.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
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
          <div className="space-y-3">
            {data.sprint ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{data.sprint.name}</span>
                  <span className="text-2xl font-bold">{data.progress}%</span>
                </div>
                <Progress value={data.progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.sprint.velocity_completed || 0} completed</span>
                  <span>{data.sprint.velocity_committed || 0} committed</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No active sprint</p>
            )}
          </div>
        );

      case 'team_velocity':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-3xl font-bold">{data.average}</span>
              <span className="text-sm text-muted-foreground ml-2">avg pts/sprint</span>
            </div>
            <div className="flex items-end justify-center gap-1 h-16">
              {data.velocities.reverse().map((v: number, i: number) => (
                <div 
                  key={i}
                  className="w-6 bg-primary rounded-t"
                  style={{ height: `${Math.max(10, (v / Math.max(...data.velocities, 1)) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        );

      case 'blockers_summary':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={`h-5 w-5 ${data.count > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className="text-2xl font-bold">{data.count}</span>
              <span className="text-sm text-muted-foreground">active blockers</span>
            </div>
            {data.blockers.slice(0, 2).map((b: any, i: number) => (
              <div key={i} className="p-2 bg-red-500/10 rounded text-sm flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">{b.priority}</Badge>
                <span className="truncate">{b.title}</span>
              </div>
            ))}
          </div>
        );

      case 'completion_rate':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{data.rate}%</span>
            </div>
            <Progress value={data.rate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.completed} completed</span>
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
    <>
      <CardHeader className="pb-2 pl-10">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-10">
        {renderWidgetContent()}
      </CardContent>
    </>
  );
}