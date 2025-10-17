import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { CheckCircle2 } from "lucide-react";

interface ActionItemsChartProps {
  data?: Array<{
    priority: string;
    completed: number;
    pending: number;
  }>;
}

const defaultData = [
  { priority: "High", completed: 8, pending: 3 },
  { priority: "Medium", completed: 12, pending: 5 },
  { priority: "Low", completed: 6, pending: 2 },
];

const COLORS = {
  completed: "#22C55E",
  pending: "#F97316",
};

export const ActionItemsChart = ({ data = defaultData }: ActionItemsChartProps) => {
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const totalPending = data.reduce((sum, item) => sum + item.pending, 0);
  const completionRate = Math.round((totalCompleted / (totalCompleted + totalPending)) * 100);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <CardTitle>Action Items Overview</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
        </div>
        <CardDescription>Action items by priority level</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="priority" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar 
              dataKey="completed" 
              fill={COLORS.completed}
              name="Completed"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="pending" 
              fill={COLORS.pending}
              name="Pending"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.completed }} />
            <span className="text-sm text-muted-foreground">
              Completed: {totalCompleted}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.pending }} />
            <span className="text-sm text-muted-foreground">
              Pending: {totalPending}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
