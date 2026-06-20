import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface VelocityData {
  date: string;
  completed_points: number;
  velocity: number;
}

interface EpicVelocityMetricsProps {
  epicId: string;
}

export function EpicVelocityMetrics({ epicId }: EpicVelocityMetricsProps) {
  const [velocityData, setVelocityData] = useState<VelocityData[]>([]);
  const [averageVelocity, setAverageVelocity] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [predictedCompletion, setPredictedCompletion] = useState<string | null>(null);

  useEffect(() => {
    loadVelocityData();
  }, [epicId]);

  const loadVelocityData = async () => {
    try {
      // Get last 30 days of snapshots
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data: snapshots, error } = await supabase
        .from('epic_progress_snapshots')
        .select('*')
        .eq('epic_id', epicId)
        .gte('snapshot_date', thirtyDaysAgo)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      if (snapshots && snapshots.length > 0) {
        const chartData: VelocityData[] = snapshots.map(snap => ({
          date: snap.snapshot_date,
          completed_points: snap.completed_story_points,
          velocity: typeof snap.velocity === 'string' ? parseFloat(snap.velocity) : (snap.velocity || 0),
        }));

        setVelocityData(chartData);

        // Calculate average velocity
        const avgVel = snapshots.reduce((sum, snap) => {
          const vel = typeof snap.velocity === 'string' ? parseFloat(snap.velocity) : (snap.velocity || 0);
          return sum + vel;
        }, 0) / snapshots.length;
        setAverageVelocity(avgVel);

        // Determine trend (comparing recent vs. older data)
        if (snapshots.length >= 4) {
          const getVelocity = (snap: any): number => {
            const vel = snap.velocity;
            return typeof vel === 'string' ? parseFloat(vel) : (vel || 0);
          };
          
          const recentAvg = (getVelocity(snapshots[snapshots.length - 1]) + getVelocity(snapshots[snapshots.length - 2])) / 2;
          const olderAvg = (getVelocity(snapshots[0]) + getVelocity(snapshots[1])) / 2;
          
          if (recentAvg > olderAvg * 1.1) {
            setTrend('up');
          } else if (recentAvg < olderAvg * 0.9) {
            setTrend('down');
          } else {
            setTrend('stable');
          }
        }

        // Predict completion date
        const lastSnapshot = snapshots[snapshots.length - 1];
        const remainingPoints = lastSnapshot.total_story_points - lastSnapshot.completed_story_points;
        
        if (avgVel > 0 && remainingPoints > 0) {
          const daysToComplete = Math.ceil(remainingPoints / avgVel);
          const completionDate = new Date();
          completionDate.setDate(completionDate.getDate() + daysToComplete);
          setPredictedCompletion(format(completionDate, 'MMM d, yyyy'));
        }
      }
    } catch (error: any) {
      console.error('Error loading velocity data:', error);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'up':
        return 'Velocity is increasing';
      case 'down':
        return 'Velocity is decreasing';
      default:
        return 'Velocity is stable';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Velocity Metrics</CardTitle>
        <CardDescription>
          Track team velocity and predict completion dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {velocityData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No velocity data available</p>
            <p className="text-sm mt-2">Record progress snapshots to see velocity trends</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Avg Velocity</p>
                </div>
                <p className="text-2xl font-bold">{averageVelocity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">points/day</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getTrendIcon()}
                  <p className="text-sm text-muted-foreground">Trend</p>
                </div>
                <p className="text-lg font-semibold capitalize">{trend}</p>
                <p className="text-xs text-muted-foreground mt-1">{getTrendText()}</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <p className="text-sm text-muted-foreground">Predicted</p>
                </div>
                <p className="text-sm font-semibold">
                  {predictedCompletion || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">completion date</p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} pts${name.includes('velocity') ? '/day' : ''}`,
                      name === 'completed_points' ? 'Completed' : 'Daily Velocity'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completed_points" 
                    fill="hsl(var(--chart-2))" 
                    name="Completed Points"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="velocity" 
                    fill="hsl(var(--primary))" 
                    name="Daily Velocity"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-semibold mb-2">Velocity Insights:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Velocity is calculated from completed story points over time</li>
                <li>• Higher velocity means faster feature completion</li>
                <li>• Predicted completion uses current average velocity</li>
                <li>• Track velocity trends to optimize team performance</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
