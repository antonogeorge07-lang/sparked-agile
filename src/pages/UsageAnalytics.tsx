import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Users, Zap, DollarSign, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import { sampleAIUsageStats, sampleActivityStats } from "@/data/sampleAnalyticsData";
import { useTranslation } from "react-i18next";

// Use semantic colors from design system
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function UsageAnalytics() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // All hooks must be called before any conditional returns
  const { data: projects } = useQuery({
    queryKey: ["pmi-projects-list"],
    queryFn: async () => {
      const { data } = await supabase.from("pmi_projects").select("id, name");
      return data || [];
    },
    enabled: role === 'admin',
  });

  const { data: aiUsageStats } = useQuery({
    queryKey: ["ai-usage-stats", timeRange, selectedProject],
    queryFn: async () => {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Use sanitized view that only shows user's own usage
      const { data, error } = await supabase
        .from("ai_usage_logs_sanitized")
        .select("*")
        .gte("created_at", startDate.toISOString());
      if (error) throw error;

      return data || [];
    },
    enabled: role === 'admin',
  });

  const { data: activityStats } = useQuery({
    queryKey: ["activity-stats", timeRange, selectedProject],
    queryFn: async () => {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from("user_activity_logs")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: role === 'admin',
  });

  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      navigate('/');
    }
  }, [role, roleLoading, navigate]);

  // Use sample data as fallback when no real data exists
  const showingSampleAI = !aiUsageStats || aiUsageStats.length === 0;
  const showingSampleActivity = !activityStats || activityStats.length === 0;
  const displayAIStats = showingSampleAI ? sampleAIUsageStats : aiUsageStats;
  const displayActivityStats = showingSampleActivity ? sampleActivityStats : activityStats;

  // Calculate metrics
  const totalAICalls = displayAIStats?.length || 0;
  const successfulCalls = displayAIStats?.filter((log: any) => log.status === 'success').length || 0;
  const successRate = totalAICalls > 0 ? Math.round((successfulCalls / totalAICalls) * 100) : 0;
  const uniqueUsers = new Set(displayActivityStats?.map((log: any) => log.user_id)).size;

  // Conditional returns after all hooks
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-6">
          <LoadingState message="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  // Prepare chart data
  const aiCallsByDay = displayAIStats?.reduce((acc: any, log: any) => {
    const date = new Date(log.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const dailyAIData = Object.entries(aiCallsByDay || {}).map(([date, calls]) => ({
    date,
    calls,
  }));

  const modelUsage = displayAIStats?.reduce((acc: any, log: any) => {
    acc[log.model] = (acc[log.model] || 0) + 1;
    return acc;
  }, {});

  const modelData = Object.entries(modelUsage || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const actionsByType = displayActivityStats?.reduce((acc: any, log: any) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  const actionsData = Object.entries(actionsByType || {}).map(([action, count]) => ({
    action,
    count,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Usage Analytics</h1>
            <p className="text-muted-foreground">
              Track active users, projects, and AI API usage
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sample data banner */}
        {(showingSampleAI || showingSampleActivity) && (
          <div className="p-3 rounded-lg bg-muted/60 border border-border text-sm text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            Showing sample data. Real analytics will populate as users interact with the platform.
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique users in period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI API Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAICalls}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total AI requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {successfulCalls} of {totalAICalls} calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Models Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(modelUsage || {}).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique AI models
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ai-usage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ai-usage">AI Usage</TabsTrigger>
            <TabsTrigger value="user-activity">User Activity</TabsTrigger>
            <TabsTrigger value="models">Model Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Calls Over Time</CardTitle>
                <CardDescription>Daily AI API call volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyAIData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Actions</CardTitle>
                <CardDescription>Distribution of user activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={actionsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="action" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Usage</CardTitle>
                <CardDescription>Distribution of AI model calls</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {modelData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modelData.map((model: { name: string; value: number }, index: number) => (
                    <div key={model.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <Badge>{model.value} calls</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
