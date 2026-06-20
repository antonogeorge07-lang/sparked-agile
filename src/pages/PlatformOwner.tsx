import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import { 
  Crown, Users, TrendingUp, Activity, MessageSquare, 
  ThumbsUp, ThumbsDown, Star, AlertCircle, CheckCircle2,
  BarChart3, PieChart, LineChart as LineChartIcon
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface PlatformStats {
  total_users: number;
  total_workspaces: number;
  total_projects: number;
  active_users_30d: number;
  new_users_7d: number;
}

interface UserFeedback {
  id: string;
  feedback_type: string;
  message: string;
  sentiment: string;
  status: string;
  page: string;
  created_at: string;
  user_id: string;
}

interface SurveyResponse {
  id: string;
  rating: number;
  nps_score: number;
  feedback_text: string;
  page: string;
  created_at: string;
}

export default function PlatformOwner() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    checkAccess();
  }, [roleLoading, navigate]);

  const checkAccess = async () => {
    if (roleLoading) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      const { data: ownerCheck } = await supabase.rpc('is_platform_owner', { user_id: user.id });
      if (!ownerCheck) {
        navigate('/');
        return;
      }

      setIsOwner(true);
      setUserEmail(user.email ?? null);
      await loadAllData();
    } catch (error) {
      console.error("Access check failed:", error);
      navigate('/');
    }
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadPlatformStats(),
        loadUserFeedback(),
        loadSurveyResponses(),
        loadUserGrowth(),
        loadActivityMetrics()
      ]);
    } catch (error) {
      console.error("Error loading platform data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformStats = async () => {
    const { data, error } = await supabase.rpc('get_platform_stats');
    if (error) throw error;
    if (data && data.length > 0) {
      setStats(data[0]);
    }
  };

  const loadUserFeedback = async () => {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    setFeedback(data || []);
  };

  const loadSurveyResponses = async () => {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    setSurveys(data || []);
  };

  const loadUserGrowth = async () => {
    // Use profiles_safe view - platform owner has admin access so can see all profiles
    // This view masks email for non-admins but allows access to created_at for metrics
    const { data, error } = await supabase
      .from('profiles_safe')
      .select('created_at')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Group by date
    const growthByDate = (data || []).reduce((acc: any, profile) => {
      const date = new Date(profile.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const growthData = Object.entries(growthByDate).map(([date, count]) => ({
      date,
      users: count
    })).slice(-30); // Last 30 days

    setUserGrowth(growthData);
  };

  const loadActivityMetrics = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('action, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (error) throw error;

    const actionsByType = (data || []).reduce((acc: any, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    const actionsData = Object.entries(actionsByType)
      .map(([action, count]) => ({ action, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    setActivityData(actionsData);
  };

  const getFeedbackStats = () => {
    const positive = feedback.filter(f => f.sentiment === 'positive').length;
    const negative = feedback.filter(f => f.sentiment === 'negative').length;
    const neutral = feedback.filter(f => f.sentiment === 'neutral').length;
    
    return { positive, negative, neutral };
  };

  const getAverageRating = () => {
    const ratings = surveys.filter(s => s.rating).map(s => s.rating);
    if (ratings.length === 0) return 0;
    return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
  };

  const getAverageNPS = () => {
    const scores = surveys.filter(s => s.nps_score).map(s => s.nps_score);
    if (scores.length === 0) return 0;
    return (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);
  };

  const getSentimentData = () => {
    const sentimentStats = getFeedbackStats();
    return [
      { name: 'Positive', value: sentimentStats.positive },
      { name: 'Neutral', value: sentimentStats.neutral },
      { name: 'Negative', value: sentimentStats.negative }
    ];
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    const { error } = await supabase
      .from('user_feedback')
      .update({ status: newStatus })
      .eq('id', feedbackId);

    if (!error) {
      setFeedback(prev => 
        prev.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f)
      );
    }
  };

  if (loading || roleLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading platform analytics..." />
      </DashboardLayout>
    );
  }

  if (!isOwner) {
    return null;
  }

  const feedbackStats = getFeedbackStats();
  const sentimentData = getSentimentData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Helmet>
          <title>Platform Admin - Spark-Agile</title>
          <meta name="description" content="Platform administration dashboard for managing users, security, and system configuration." />
        </Helmet>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Crown className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Platform Owner Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor platform health, user feedback, and growth metrics
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.new_users_7d || 0} new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.active_users_30d || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getAverageRating()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 5.0
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getAverageNPS()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Net Promoter Score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{feedback.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total submissions
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Suggestions</TabsTrigger>
            <TabsTrigger value="surveys">Survey Responses</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    User Growth (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
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
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Feedback Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{feedbackStats.positive}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Positive</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{feedbackStats.neutral}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Neutral</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span className="font-semibold">{feedbackStats.negative}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Negative</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Feedback & Suggestions</CardTitle>
                <CardDescription>
                  Review and manage feedback from users to improve the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              item.sentiment === 'positive' ? 'default' : 
                              item.sentiment === 'negative' ? 'destructive' : 
                              'secondary'
                            }>
                              {item.sentiment || 'neutral'}
                            </Badge>
                            <Badge variant="outline">{item.feedback_type}</Badge>
                            {item.page && (
                              <span className="text-xs text-muted-foreground">
                                Page: {item.page}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{item.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()} at{' '}
                            {new Date(item.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={item.status === 'reviewed' ? 'default' : 'outline'}
                            onClick={() => updateFeedbackStatus(item.id, 'reviewed')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={item.status === 'resolved' ? 'default' : 'outline'}
                            onClick={() => updateFeedbackStatus(item.id, 'resolved')}
                          >
                            Resolved
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {feedback.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No feedback received yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Survey Responses</CardTitle>
                <CardDescription>
                  User ratings and detailed feedback from surveys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {survey.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < survey.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {survey.nps_score !== null && (
                            <Badge variant="outline">NPS: {survey.nps_score}</Badge>
                          )}
                          {survey.page && (
                            <span className="text-xs text-muted-foreground">
                              Page: {survey.page}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(survey.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {survey.feedback_text && (
                        <p className="text-sm text-muted-foreground">{survey.feedback_text}</p>
                      )}
                    </div>
                  ))}
                  {surveys.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No survey responses yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top User Actions (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={activityData}>
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
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Workspaces</span>
                    <span className="font-semibold">{stats?.total_workspaces}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-semibold">{stats?.total_projects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Projects/User</span>
                    <span className="font-semibold">
                      {stats?.total_users ? (stats.total_projects / stats.total_users).toFixed(1) : 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Rate</span>
                    <span className="font-semibold">
                      {stats?.total_users 
                        ? ((stats.active_users_30d / stats.total_users) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Growth Rate</span>
                    <span className="font-semibold">
                      {stats?.total_users 
                        ? ((stats.new_users_7d / stats.total_users) * 100).toFixed(1)
                        : 0}%/week
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Satisfaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Positive Feedback</span>
                    <span className="font-semibold">
                      {feedback.length ? ((feedbackStats.positive / feedback.length) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Rate</span>
                    <span className="font-semibold">{surveys.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
