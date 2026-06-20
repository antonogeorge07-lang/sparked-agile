import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface CommitmentDataPoint {
  sprint_number: number;
  committed_points: number;
  delivered_points: number;
  accuracy_percentage: number;
}

interface CommitmentDeliveryChartProps {
  data: CommitmentDataPoint[];
  isLoading?: boolean;
}

export function CommitmentDeliveryChart({ data, isLoading }: CommitmentDeliveryChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Commitment vs Delivery
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
            <Target className="h-5 w-5 text-primary" />
            Commitment vs Delivery
          </CardTitle>
          <CardDescription>
            Track how well your team delivers on sprint commitments
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sprint data available yet</p>
            <p className="text-sm mt-1">Complete a sprint to see commitment tracking</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall stats
  const avgAccuracy = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.accuracy_percentage, 0) / data.length)
    : 0;

  const lastSprint = data[data.length - 1];
  const prevSprint = data.length > 1 ? data[data.length - 2] : null;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (prevSprint) {
    if (lastSprint.accuracy_percentage > prevSprint.accuracy_percentage) trend = 'up';
    else if (lastSprint.accuracy_percentage < prevSprint.accuracy_percentage) trend = 'down';
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Commitment vs Delivery
            </CardTitle>
            <CardDescription>
              Compare planned story points against delivered
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">{avgAccuracy}%</span>
                {getTrendIcon()}
              </div>
            </div>
            <Badge 
              variant={avgAccuracy >= 90 ? "default" : avgAccuracy >= 70 ? "secondary" : "destructive"}
            >
              {avgAccuracy >= 90 ? "Excellent" : avgAccuracy >= 70 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="sprint_number" 
              tickFormatter={(value) => `Sprint ${value}`}
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
                name === 'committed_points' ? 'Committed' : 'Delivered'
              ]}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
            <Bar 
              dataKey="committed_points" 
              name="Committed" 
              fill="hsl(var(--muted))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="delivered_points" 
              name="Delivered" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Accuracy breakdown */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.slice(-4).map((sprint) => (
            <div key={sprint.sprint_number} className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Sprint {sprint.sprint_number}</p>
              <p className={`text-lg font-bold ${
                sprint.accuracy_percentage >= 90 ? 'text-green-500' :
                sprint.accuracy_percentage >= 70 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {sprint.accuracy_percentage}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
