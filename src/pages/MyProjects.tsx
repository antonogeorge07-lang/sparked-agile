import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Calendar, ExternalLink, Building2, Plus } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceProjects } from "@/hooks/useWorkspaceProjects";

export default function MyProjects() {
  const navigate = useNavigate();
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { projects, loading: projectsLoading } = useWorkspaceProjects(workspace?.id);
  
  const loading = workspaceLoading || projectsLoading;

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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BackButton className="mb-6" />
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Workspace</h1>
                <p className="text-muted-foreground">
                  {workspace?.name || "Loading..."}
                </p>
              </div>
            </div>
            
            <Button onClick={() => navigate('/workspace/settings')} variant="outline">
              Manage Workspace
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Projects
              </h2>
              <p className="text-sm text-muted-foreground">
                {projects.length} of 5 projects
              </p>
            </div>
            
            {projects.length < 5 && (
              <Button onClick={() => navigate('/dashboard')} className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            )}
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No Projects Yet"
              description="Create your first project to get started with your workspace."
              actionLabel="Create Project"
              onAction={() => navigate('/dashboard')}
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
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
    </div>
  );
}
