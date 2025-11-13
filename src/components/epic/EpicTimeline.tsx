import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";

interface Epic {
  id: string;
  title: string;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  color_hex: string;
}

interface EpicTimelineProps {
  projectId: string;
}

export function EpicTimeline({ projectId }: EpicTimelineProps) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month');
  const { toast } = useToast();

  useEffect(() => {
    loadEpics();
  }, [projectId]);

  const loadEpics = async () => {
    try {
      const { data: valueStreams } = await supabase
        .from('value_streams')
        .select('id')
        .eq('project_id', projectId);

      if (!valueStreams || valueStreams.length === 0) return;

      const { data: epicsData, error } = await supabase
        .from('epics')
        .select('id, title, status, priority, start_date, end_date, color_hex')
        .in('value_stream_id', valueStreams.map(vs => vs.id))
        .not('start_date', 'is', null)
        .not('end_date', 'is', null)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEpics(epicsData || []);
    } catch (error: any) {
      console.error('Error loading epics:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline data",
        variant: "destructive",
      });
    }
  };

  const getTimelineRange = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = getTimelineRange();
  const weeks = Math.ceil(days.length / 7);

  const getEpicPosition = (epic: Epic) => {
    if (!epic.start_date || !epic.end_date) return null;

    const epicStart = new Date(epic.start_date);
    const epicEnd = new Date(epic.end_date);
    const timelineStart = days[0];
    const timelineEnd = days[days.length - 1];

    // Check if epic overlaps with current view
    const overlaps = isWithinInterval(epicStart, { start: timelineStart, end: timelineEnd }) ||
                     isWithinInterval(epicEnd, { start: timelineStart, end: timelineEnd }) ||
                     (epicStart <= timelineStart && epicEnd >= timelineEnd);

    if (!overlaps) return null;

    const startDay = days.findIndex(day => isSameDay(day, epicStart) || day > epicStart);
    const endDay = days.findIndex(day => isSameDay(day, epicEnd)) || days.length - 1;

    const actualStart = startDay === -1 ? 0 : startDay;
    const actualEnd = endDay === -1 ? days.length - 1 : endDay;

    return {
      left: `${(actualStart / days.length) * 100}%`,
      width: `${((actualEnd - actualStart + 1) / days.length) * 100}%`,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/80 border-destructive';
      case 'high': return 'bg-orange-500/80 border-orange-500';
      case 'medium': return 'bg-blue-500/80 border-blue-500';
      case 'low': return 'bg-muted border-muted-foreground';
      default: return 'bg-muted border-muted-foreground';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Epic Timeline</CardTitle>
            <CardDescription>
              Gantt-style view of epic schedules and dependencies
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {epics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No epics with dates found</p>
            <p className="text-sm mt-2">Add start and end dates to epics to see them on the timeline</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline header */}
            <div className="flex border-b pb-2">
              <div className="w-48 font-semibold text-sm">Epic</div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                {days.map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-xs text-muted-foreground border-l first:border-l-0"
                  >
                    {format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline rows */}
            <div className="space-y-3">
              {epics.map(epic => {
                const position = getEpicPosition(epic);
                if (!position) return null;

                return (
                  <div key={epic.id} className="flex items-center group">
                    <div className="w-48 pr-4">
                      <div className="text-sm font-medium truncate">{epic.title}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {epic.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {epic.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 relative h-12">
                      {/* Background grid */}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                        {days.map((_, index) => (
                          <div key={index} className="border-l first:border-l-0 h-full" />
                        ))}
                      </div>
                      
                      {/* Epic bar */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md border-2 ${getPriorityColor(epic.priority)} flex items-center justify-center text-xs font-medium text-white shadow-lg cursor-pointer hover:scale-105 transition-transform`}
                        style={position}
                      >
                        <span className="truncate px-2">{epic.title}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Priority Legend</div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive/80 border-2 border-destructive" />
                  <span className="text-xs">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500/80 border-2 border-orange-500" />
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500/80 border-2 border-blue-500" />
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted border-2 border-muted-foreground" />
                  <span className="text-xs">Low</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
