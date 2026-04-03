import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { LoadingState } from "@/components/LoadingState";
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Epic {
  id: string;
  title: string;
  status: string;
  health_score: string;
  current_velocity: number;
  target_velocity: number;
  business_value: number;
  project_name?: string;
  value_stream_name?: string;
  created_at: string;
  end_date?: string;
}

interface ROIData {
  epic_id: string;
  epic_title: string;
  investment_amount: number;
  returns_amount: number;
  roi_percentage: number;
}

interface VelocityTrend {
  date: string;
  average_velocity: number;
  epic_count: number;
}

interface HealthDistribution {
  status: string;
  count: number;
  color: string;
}

export default function EpicPortfolio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [roiData, setRoiData] = useState<ROIData[]>([]);
  const [velocityTrends, setVelocityTrends] = useState<VelocityTrend[]>([]);
  const [healthDistribution, setHealthDistribution] = useState<HealthDistribution[]>([]);
  const [atRiskEpics, setAtRiskEpics] = useState<Epic[]>([]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }


    await loadPortfolioData();
  };

  const loadPortfolioData = async () => {
    try {
      setLoading(true);

      // Get all epics user has access to through project membership
      const { data: epicsData, error: epicsError } = await supabase
        .from("epics")
        .select(`
          id,
          title,
          status,
          health_score,
          current_velocity,
          target_velocity,
          business_value,
          created_at,
          end_date,
          value_streams!inner(
            name,
            projects!inner(
              name,
              project_members!inner(user_id)
            )
          )
        `)
        .eq("value_streams.projects.project_members.user_id", (await supabase.auth.getUser()).data.user?.id);

      if (epicsError) throw epicsError;

      const formattedEpics = epicsData?.map((epic: any) => ({
        id: epic.id,
        title: epic.title,
        status: epic.status,
        health_score: epic.health_score,
        current_velocity: epic.current_velocity || 0,
        target_velocity: epic.target_velocity || 0,
        business_value: epic.business_value || 0,
        project_name: epic.value_streams?.projects?.name,
        value_stream_name: epic.value_streams?.name,
        created_at: epic.created_at,
        end_date: epic.end_date,
      })) || [];

      setEpics(formattedEpics);

      // Calculate health distribution
      const healthCounts = formattedEpics.reduce((acc: any, epic: Epic) => {
        const health = epic.health_score || 'on_track';
        acc[health] = (acc[health] || 0) + 1;
        return acc;
      }, {});

      const healthDist: HealthDistribution[] = [
        { status: 'on_track', count: healthCounts.on_track || 0, color: '#10b981' },
        { status: 'at_risk', count: healthCounts.at_risk || 0, color: '#f59e0b' },
        { status: 'critical', count: healthCounts.critical || 0, color: '#ef4444' },
      ];
      setHealthDistribution(healthDist);

      // Get at-risk epics
      const atRisk = formattedEpics.filter((epic: Epic) => 
        epic.health_score === 'at_risk' || epic.health_score === 'critical'
      );
      setAtRiskEpics(atRisk);

      // Load ROI data
      const { data: roiData, error: roiError } = await supabase
        .from("epic_roi_tracking")
        .select(`
          epic_id,
          investment_amount,
          returns_amount,
          roi_percentage,
          epics!inner(
            title,
            value_streams!inner(
              projects!inner(
                project_members!inner(user_id)
              )
            )
          )
        `)
        .eq("epics.value_streams.projects.project_members.user_id", (await supabase.auth.getUser()).data.user?.id);

      if (!roiError && roiData) {
        const formattedROI: ROIData[] = roiData.map((item: any) => ({
          epic_id: item.epic_id,
          epic_title: item.epics?.title || 'Unknown',
          investment_amount: item.investment_amount || 0,
          returns_amount: item.returns_amount || 0,
          roi_percentage: item.roi_percentage || 0,
        }));
        setRoiData(formattedROI);
      }

      // Calculate velocity trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: snapshotsData, error: snapshotsError } = await supabase
        .from("epic_progress_snapshots")
        .select(`
          snapshot_date,
          velocity,
          epics!inner(
            value_streams!inner(
              projects!inner(
                project_members!inner(user_id)
              )
            )
          )
        `)
        .gte("snapshot_date", thirtyDaysAgo.toISOString().split('T')[0])
        .eq("epics.value_streams.projects.project_members.user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("snapshot_date", { ascending: true });

      if (!snapshotsError && snapshotsData) {
        // Group by date and calculate average velocity
        const velocityByDate = snapshotsData.reduce((acc: any, snapshot: any) => {
          const date = snapshot.snapshot_date;
          if (!acc[date]) {
            acc[date] = { total: 0, count: 0 };
          }
          acc[date].total += snapshot.velocity || 0;
          acc[date].count += 1;
          return acc;
        }, {});

        const trends: VelocityTrend[] = Object.keys(velocityByDate).map(date => ({
          date,
          average_velocity: velocityByDate[date].total / velocityByDate[date].count,
          epic_count: velocityByDate[date].count,
        }));

        setVelocityTrends(trends);
      }

    } catch (error) {
      console.error("Error loading portfolio data:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalROI = roiData.reduce((sum, item) => sum + (item.roi_percentage || 0), 0);
  const averageROI = roiData.length > 0 ? totalROI / roiData.length : 0;
  const totalInvestment = roiData.reduce((sum, item) => sum + item.investment_amount, 0);
  const totalReturns = roiData.reduce((sum, item) => sum + item.returns_amount, 0);
  const averageVelocity = epics.reduce((sum, epic) => sum + (epic.current_velocity || 0), 0) / (epics.length || 1);
  const totalBusinessValue = epics.reduce((sum, epic) => sum + (epic.business_value || 0), 0);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'on_track':
        return 'text-green-500';
      case 'at_risk':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'on_track':
        return <CheckCircle className="h-4 w-4" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingState message="Loading epic portfolio..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold">{t("pages.epicPortfolio.dashboardTitle")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("pages.epicPortfolio.crossEpicAnalytics")}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.epicPortfolio.totalEpics")}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{epics.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {epics.filter(e => e.status === 'active').length} {t("pages.epicPortfolio.active")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.epicPortfolio.averageROI")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageROI.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${totalReturns.toLocaleString()} returns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Velocity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageVelocity.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Story points per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {atRiskEpics.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health Analysis</TabsTrigger>
            <TabsTrigger value="roi">ROI Tracking</TabsTrigger>
            <TabsTrigger value="velocity">Velocity Trends</TabsTrigger>
            <TabsTrigger value="at-risk">At-Risk Epics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Distribution</CardTitle>
                  <CardDescription>Epic health status across portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={healthDistribution}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.status.replace('_', ' ')}: ${entry.count}`}
                      >
                        {healthDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Epics by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { status: 'Backlog', count: epics.filter(e => e.status === 'backlog').length },
                        { status: 'Active', count: epics.filter(e => e.status === 'active').length },
                        { status: 'In Progress', count: epics.filter(e => e.status === 'in_progress').length },
                        { status: 'Completed', count: epics.filter(e => e.status === 'completed').length },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business Value Overview</CardTitle>
                <CardDescription>Total business value: {totalBusinessValue}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {epics
                    .sort((a, b) => (b.business_value || 0) - (a.business_value || 0))
                    .slice(0, 10)
                    .map((epic) => (
                      <div key={epic.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{epic.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {epic.value_stream_name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{epic.project_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{epic.business_value}</Badge>
                          <div className={getHealthColor(epic.health_score)}>
                            {getHealthIcon(epic.health_score)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Distribution</CardTitle>
                <CardDescription>Breakdown of epic health across portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {healthDistribution.map((dist) => (
                    <Card key={dist.status}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium capitalize">
                          {dist.status.replace('_', ' ')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold" style={{ color: dist.color }}>
                          {dist.count}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {((dist.count / epics.length) * 100).toFixed(1)}% of total
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={healthDistribution}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" />
                    <Tooltip />
                    <Bar dataKey="count">
                      {healthDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalInvestment.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    ${totalReturns.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Portfolio ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalInvestment > 0 ? (((totalReturns - totalInvestment) / totalInvestment) * 100).toFixed(1) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ROI by Epic</CardTitle>
                <CardDescription>Return on investment for each epic</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Epic</TableHead>
                      <TableHead className="text-right">Investment</TableHead>
                      <TableHead className="text-right">Returns</TableHead>
                      <TableHead className="text-right">ROI %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roiData
                      .sort((a, b) => (b.roi_percentage || 0) - (a.roi_percentage || 0))
                      .map((item) => (
                        <TableRow key={item.epic_id}>
                          <TableCell className="font-medium">{item.epic_title}</TableCell>
                          <TableCell className="text-right">
                            ${item.investment_amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.returns_amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.roi_percentage >= 0 ? "default" : "destructive"}>
                              {item.roi_percentage >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {item.roi_percentage.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="velocity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Velocity Trends (Last 30 Days)</CardTitle>
                <CardDescription>Average story points completed per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={velocityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => [value.toFixed(2), 'Avg Velocity']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="average_velocity" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Average Velocity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Velocity vs Target</CardTitle>
                <CardDescription>Current velocity compared to target velocity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {epics
                    .filter(e => e.target_velocity > 0)
                    .sort((a, b) => (b.current_velocity / b.target_velocity) - (a.current_velocity / a.target_velocity))
                    .slice(0, 10)
                    .map((epic) => {
                      const percentage = (epic.current_velocity / epic.target_velocity) * 100;
                      return (
                        <div key={epic.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{epic.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {epic.current_velocity.toFixed(1)} / {epic.target_velocity}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 100 ? 'bg-green-500' :
                                percentage >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="at-risk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>At-Risk Epics ({atRiskEpics.length})</CardTitle>
                <CardDescription>Epics requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {atRiskEpics.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">All epics are on track!</p>
                    <p className="text-muted-foreground">No epics require immediate attention.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {atRiskEpics.map((epic) => (
                      <Card key={epic.id} className="border-l-4" style={{
                        borderLeftColor: epic.health_score === 'critical' ? '#ef4444' : '#f59e0b'
                      }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{epic.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {epic.project_name} • {epic.value_stream_name}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant={epic.health_score === 'critical' ? 'destructive' : 'secondary'}
                              className="ml-2"
                            >
                              {epic.health_score === 'critical' ? <AlertCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                              {epic.health_score.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <p className="font-medium capitalize">{epic.status.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Velocity</p>
                              <p className="font-medium">
                                {epic.current_velocity.toFixed(1)} / {epic.target_velocity}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Business Value</p>
                              <p className="font-medium">{epic.business_value}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p className="font-medium">
                                {epic.end_date ? new Date(epic.end_date).toLocaleDateString() : 'Not set'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            className="mt-4 w-full" 
                            onClick={() => navigate(`/epic/${epic.id}`)}
                          >
                            View Details
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
