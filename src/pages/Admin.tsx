import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import { 
  Shield, Users, Building, Activity, TrendingUp
} from "lucide-react";

interface PlatformStats {
  total_users: number;
  total_workspaces: number;
  total_projects: number;
  active_users_30d: number;
  new_users_7d: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      navigate('/');
      return;
    }
    
    if (role === 'admin') {
      loadStats();
    }
  }, [role, roleLoading, navigate]);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error("Error loading platform stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading admin panel..." />
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Platform Admin</h1>
              <p className="text-muted-foreground">
                Monitor platform-wide usage and performance
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workspaces</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_workspaces || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_projects || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users (30d)</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.active_users_30d || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Users active in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users (7d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.new_users_7d || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Signups in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/security-incidents")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Monitor</div>
              <p className="text-xs text-muted-foreground mt-1">
                Security incident tracking
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Notice</CardTitle>
            <CardDescription>
              As a platform admin, you can only view aggregate statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                This dashboard respects user privacy. You can see overall platform metrics but cannot access individual user data, workspace contents, or projects. Each workspace owner has full control and privacy over their data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
