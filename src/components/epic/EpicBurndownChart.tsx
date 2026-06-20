import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingDown, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface Snapshot {
  snapshot_date: string;
  total_story_points: number;
  completed_story_points: number;
  remaining_points: number;
}

interface EpicBurndownChartProps {
  epicId: string;
  startDate?: string | null;
  endDate?: string | null;
}

export function EpicBurndownChart({ epicId, startDate, endDate }: EpicBurndownChartProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSnapshots();
  }, [epicId]);

  const loadSnapshots = async () => {
    try {
      const { data, error } = await supabase
        .from('epic_progress_snapshots')
        .select('*')
        .eq('epic_id', epicId)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const chartData = data.map(snap => ({
          snapshot_date: snap.snapshot_date,
          total_story_points: snap.total_story_points,
          completed_story_points: snap.completed_story_points,
          remaining_points: snap.total_story_points - snap.completed_story_points,
        }));
        
        setSnapshots(chartData);
        setTotalPoints(chartData[chartData.length - 1]?.total_story_points || 0);
      }
    } catch (error: any) {
      console.error('Error loading snapshots:', error);
      toast({
        title: "Error",
        description: "Failed to load burndown data",
        variant: "destructive",
      });
    }
  };

  const handleCreateSnapshot = async () => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase.rpc('create_epic_progress_snapshot', {
        epic_id_param: epicId
      });

      if (error) throw error;

      await loadSnapshots();
      
      toast({
        title: "Snapshot created",
        description: "Progress snapshot has been recorded",
      });
    } catch (error: any) {
      console.error('Error creating snapshot:', error);
      toast({
        title: "Error",
        description: "Failed to create snapshot",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate ideal burndown line
  const getIdealBurndown = () => {
    if (!startDate || !endDate || snapshots.length === 0) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const pointsPerDay = totalPoints / totalDays;

    return snapshots.map((snap, index) => ({
      ...snap,
      ideal_remaining: Math.max(0, totalPoints - (pointsPerDay * index)),
    }));
  };

  const chartData = getIdealBurndown();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Epic Burndown Chart</CardTitle>
            <CardDescription>
              Track story point completion over time
            </CardDescription>
          </div>
          <Button 
            onClick={handleCreateSnapshot} 
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Record Progress
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {snapshots.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No progress data yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Record Progress" to create your first snapshot
            </p>
            <Button onClick={handleCreateSnapshot} disabled={isRefreshing}>
              <Calendar className="mr-2 h-4 w-4" />
              Record First Snapshot
            </Button>
          </div>
        ) : (
          <>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="snapshot_date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                    formatter={(value: number) => [`${value} pts`, '']}
                  />
                  <Legend />
                  
                  {/* Ideal burndown line */}
                  {startDate && endDate && (
                    <Line 
                      type="linear" 
                      dataKey="ideal_remaining" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                      name="Ideal Burndown"
                      dot={false}
                    />
                  )}
                  
                  {/* Actual remaining points */}
                  <Line 
                    type="monotone" 
                    dataKey="remaining_points" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Remaining Points"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  
                  {/* Completed points */}
                  <Line 
                    type="monotone" 
                    dataKey="completed_story_points" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Completed Points"
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                  />
                  
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-500">
                  {snapshots[snapshots.length - 1]?.completed_story_points || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                <p className="text-2xl font-bold text-primary">
                  {snapshots[snapshots.length - 1]?.remaining_points || 0}
                </p>
              </div>
            </div>

            {startDate && endDate && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  <strong>Timeline:</strong> {format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
