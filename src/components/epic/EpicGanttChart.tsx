import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, format, addDays, max as dateMax, min as dateMin, parseISO, isValid } from "date-fns";

interface EpicGanttChartProps {
  projectId: string;
}

interface GanttEpic {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  priority: string;
  health_score: string;
  color_hex: string;
  dependencies: string[];
}

export function EpicGanttChart({ projectId }: EpicGanttChartProps) {
  const [epics, setEpics] = useState<GanttEpic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpics();
  }, [projectId]);

  const loadEpics = async () => {
    setLoading(true);
    const { data: epicsData } = await supabase
      .from('epics')
      .select(`
        id, title, start_date, end_date, status, priority, health_score, color_hex,
        value_streams!inner(project_id),
        epic_dependencies(depends_on_epic_id)
      `)
      .eq('value_streams.project_id', projectId)
      .neq('status', 'archived')
      .order('start_date', { ascending: true, nullsFirst: false });

    if (epicsData) {
      setEpics(epicsData.map((e: any) => ({
        ...e,
        dependencies: e.epic_dependencies?.map((d: any) => d.depends_on_epic_id) || [],
      })));
    }
    setLoading(false);
  };

  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    const datedEpics = epics.filter(e => e.start_date && e.end_date);
    if (datedEpics.length === 0) {
      const today = new Date();
      return { timelineStart: today, timelineEnd: addDays(today, 90), totalDays: 90 };
    }

    const starts = datedEpics.map(e => parseISO(e.start_date!));
    const ends = datedEpics.map(e => parseISO(e.end_date!));
    const tStart = addDays(dateMin(starts), -7);
    const tEnd = addDays(dateMax(ends), 14);
    return {
      timelineStart: tStart,
      timelineEnd: tEnd,
      totalDays: Math.max(differenceInDays(tEnd, tStart), 30),
    };
  }, [epics]);

  const months = useMemo(() => {
    const result: { label: string; startPct: number; widthPct: number }[] = [];
    let current = new Date(timelineStart);
    while (current < timelineEnd) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const startPct = Math.max(0, (differenceInDays(monthStart, timelineStart) / totalDays) * 100);
      const endPct = Math.min(100, (differenceInDays(monthEnd, timelineStart) / totalDays) * 100);
      result.push({ label: format(monthStart, 'MMM yyyy'), startPct, widthPct: endPct - startPct });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    return result;
  }, [timelineStart, timelineEnd, totalDays]);

  const todayPct = useMemo(() => {
    return (differenceInDays(new Date(), timelineStart) / totalDays) * 100;
  }, [timelineStart, totalDays]);

  const getHealthBg = (h: string) => {
    if (h === 'critical') return 'bg-red-500/20 border-red-500/40';
    if (h === 'at_risk') return 'bg-yellow-500/20 border-yellow-500/40';
    return '';
  };

  if (loading) return <Card><CardContent className="py-12 text-center text-muted-foreground">Loading Gantt chart...</CardContent></Card>;

  const datedEpics = epics.filter(e => e.start_date && e.end_date);
  const undatedEpics = epics.filter(e => !e.start_date || !e.end_date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Epic Gantt Chart</CardTitle>
        <CardDescription>Timeline view with dependency awareness</CardDescription>
      </CardHeader>
      <CardContent>
        {datedEpics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No epics with dates found. Set start/end dates on your epics to see the Gantt view.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            {/* Month headers */}
            <div className="relative h-8 border-b mb-2">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-center text-xs font-medium text-muted-foreground border-l border-border pl-1"
                  style={{ left: `${m.startPct}%`, width: `${m.widthPct}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Today line */}
            {todayPct >= 0 && todayPct <= 100 && (
              <div
                className="absolute top-8 bottom-0 w-0.5 bg-primary/60 z-10"
                style={{ left: `${todayPct}%` }}
              >
                <span className="absolute -top-5 -translate-x-1/2 text-[10px] bg-primary text-primary-foreground px-1 rounded">Today</span>
              </div>
            )}

            {/* Epic bars */}
            <div className="space-y-2 relative min-h-[100px]">
              {datedEpics.map((epic) => {
                const start = parseISO(epic.start_date!);
                const end = parseISO(epic.end_date!);
                const leftPct = (differenceInDays(start, timelineStart) / totalDays) * 100;
                const widthPct = Math.max(2, (differenceInDays(end, start) / totalDays) * 100);

                return (
                  <div key={epic.id} className="relative h-10 flex items-center">
                    <div
                      className={`absolute h-8 rounded-md border flex items-center px-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${getHealthBg(epic.health_score)}`}
                      style={{
                        left: `${Math.max(0, leftPct)}%`,
                        width: `${widthPct}%`,
                        backgroundColor: epic.color_hex ? `${epic.color_hex}30` : undefined,
                        borderColor: epic.color_hex || undefined,
                        minWidth: '60px',
                      }}
                      title={`${epic.title}\n${format(start, 'dd MMM')} — ${format(end, 'dd MMM')}`}
                    >
                      <span className="text-xs font-medium truncate">{epic.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Undated epics notice */}
            {undatedEpics.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">{undatedEpics.length} epic(s) without dates:</p>
                <div className="flex flex-wrap gap-2">
                  {undatedEpics.map(e => (
                    <Badge key={e.id} variant="outline" className="text-xs">{e.title}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
