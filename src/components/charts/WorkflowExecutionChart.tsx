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

const defaultData = [
  { date: "Dec 1", standup: 3, sprint: 1, retro: 0 },
  { date: "Dec 2", standup: 2, sprint: 0, retro: 1 },
  { date: "Dec 3", standup: 4, sprint: 2, retro: 0 },
  { date: "Dec 4", standup: 3, sprint: 0, retro: 0 },
  { date: "Dec 5", standup: 5, sprint: 1, retro: 1 },
  { date: "Dec 6", standup: 2, sprint: 0, retro: 0 },
  { date: "Dec 7", standup: 4, sprint: 1, retro: 2 },
];

export const WorkflowExecutionChart = ({ data = defaultData }: WorkflowExecutionChartProps) => {
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
      </CardContent>
    </Card>
  );
};
