import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Users, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useUserRole } from "@/hooks/useUserRole";
import { PendingApprovalBanner } from "@/components/PendingApprovalBanner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_role: string;
  member_count: number;
}

export default function MyProjects() {
  const navigate = useNavigate();
  const { isPending, role } = useUserRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get projects user is assigned to
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          project_id,
          role,
          projects!inner (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Count members for each project
      const projectIds = data?.map((d: any) => d.projects.id) || [];
      const { data: memberCounts } = await supabase
        .from("project_members")
        .select("project_id")
        .in("project_id", projectIds);

      const countsByProject = memberCounts?.reduce((acc: any, m: any) => {
        acc[m.project_id] = (acc[m.project_id] || 0) + 1;
        return acc;
      }, {});

      const formattedProjects: Project[] = data?.map((item: any) => ({
        id: item.projects.id,
        name: item.projects.name,
        description: item.projects.description,
        created_at: item.projects.created_at,
        member_role: item.role,
        member_count: countsByProject?.[item.projects.id] || 0,
      })) || [];

      setProjects(formattedProjects);
    } catch (error: any) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading your projects..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      {isPending && <PendingApprovalBanner />}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BackButton className="mb-6" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Projects</h1>
              <p className="text-muted-foreground">
                Projects you have access to
              </p>
            </div>
          </div>
        </div>

        {role === 'pending' && (
          <Card className="mb-6 border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg">Awaiting Admin Approval</CardTitle>
              </div>
              <CardDescription>
                Your account is pending approval. Once approved by an administrator, you'll be assigned to projects and can start collaborating with your team.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No Projects Assigned"
            description={
              role === 'pending'
                ? "You haven't been assigned to any projects yet. Your account is pending approval."
                : "You haven't been assigned to any projects yet. Contact your administrator to get project access."
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/dashboard?project=${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {project.description || "No description"}
                      </CardDescription>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{project.member_count} member{project.member_count !== 1 ? "s" : ""}</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {project.member_role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
