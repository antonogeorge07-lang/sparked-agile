import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";

interface WorkflowExecutionChartProps {
  data?: Array<{
    date: string;
    standup: number;
    sprint: number;
    retro: number;
  }>;
}

const defaultData: Array<{ date: string; standup: number; sprint: number; retro: number }> = [];

export const WorkflowExecutionChart = ({ data = defaultData }: WorkflowExecutionChartProps) => {
  const hasData = data && data.length > 0;
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <CardTitle>Workflow Execution History</CardTitle>
        </div>
        <CardDescription>AI workflow runs over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
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
              <Line 
                type="monotone" 
                dataKey="standup" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Standup Analysis"
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="sprint" 
                stroke="#F97316" 
                strokeWidth={2}
                name="Sprint Planning"
                dot={{ fill: "#F97316" }}
              />
              <Line 
                type="monotone" 
                dataKey="retro" 
                stroke="#22C55E" 
                strokeWidth={2}
                name="Retrospective"
                dot={{ fill: "#22C55E" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No workflow execution data available</p>
              <p className="text-sm mt-1">Run AI workflows to see execution history</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
