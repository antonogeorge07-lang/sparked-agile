import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Zap, ArrowUp, ArrowDown } from "lucide-react";

interface VelocityTrend {
  sprint_number: number;
  velocity: number;
  delivered_points: number;
  trend: 'up' | 'down' | 'stable';
  sprint_date: string;
}

interface VelocityTrendChartProps {
  data: VelocityTrend[];
  averageVelocity: number;
  isLoading?: boolean;
}

export function VelocityTrendChart({ data, averageVelocity, isLoading }: VelocityTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Velocity Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Velocity Trends
          </CardTitle>
          <CardDescription>
            Track your team's velocity over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No velocity data available yet</p>
            <p className="text-sm mt-1">Complete sprints to see velocity trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const lastTwo = data.slice(-2);
  let overallTrend: 'up' | 'down' | 'stable' = 'stable';
  let trendPercentage = 0;
  
  if (lastTwo.length === 2) {
    const change = lastTwo[1].delivered_points - lastTwo[0].delivered_points;
    if (lastTwo[0].delivered_points > 0) {
      trendPercentage = Math.round((change / lastTwo[0].delivered_points) * 100);
    }
    if (change > 0) overallTrend = 'up';
    else if (change < 0) overallTrend = 'down';
  }

  const getTrendBadge = () => {
    switch (overallTrend) {
      case 'up':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
            <ArrowUp className="h-3 w-3 mr-1" />
            +{trendPercentage}%
          </Badge>
        );
      case 'down':
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
            <ArrowDown className="h-3 w-3 mr-1" />
            {trendPercentage}%
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Minus className="h-3 w-3 mr-1" />
            Stable
          </Badge>
        );
    }
  };

  // Calculate rolling average (3-sprint)
  const dataWithAverage = data.map((point, index) => {
    const start = Math.max(0, index - 2);
    const window = data.slice(start, index + 1);
    const rollingAvg = window.reduce((sum, p) => sum + p.delivered_points, 0) / window.length;
    return {
      ...point,
      rolling_average: Math.round(rollingAvg)
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Velocity Trends
            </CardTitle>
            <CardDescription>
              Sprint-over-sprint velocity with rolling average
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Avg Velocity</p>
              <span className="text-2xl font-bold">{averageVelocity}</span>
              <span className="text-sm text-muted-foreground ml-1">pts/sprint</span>
            </div>
            {getTrendBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={dataWithAverage} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="sprint_number" 
              tickFormatter={(value) => `S${value}`}
              className="text-muted-foreground"
            />
            <YAxis className="text-muted-foreground" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelFormatter={(value) => `Sprint ${value}`}
              formatter={(value: number, name: string) => [
                `${value} points`,
                name === 'delivered_points' ? 'Delivered' : '3-Sprint Avg'
              ]}
            />
            <Area
              type="monotone"
              dataKey="delivered_points"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#velocityGradient)"
              name="Delivered"
            />
            <Line
              type="monotone"
              dataKey="rolling_average"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Rolling Avg"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Sprint breakdown with trend indicators */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {data.slice(-6).map((sprint, index) => (
            <div 
              key={sprint.sprint_number} 
              className="flex-shrink-0 p-3 rounded-lg bg-muted/50 text-center min-w-[80px]"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {sprint.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {sprint.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {sprint.trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">S{sprint.sprint_number}</span>
              </div>
              <p className="text-lg font-bold">{sprint.delivered_points}</p>
              <p className="text-xs text-muted-foreground">pts</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
