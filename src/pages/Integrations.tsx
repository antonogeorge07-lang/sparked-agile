import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Github, Network, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";

interface Integration {
  id: string;
  project_id: string;
  integration_type: "jira" | "github";
  name: string;
  config: {
    url?: string;
    apiToken?: string;
    repository?: string;
    organization?: string;
  };
  is_active: boolean;
  created_at: string;
}

const Integrations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { activeUsers } = useRealtimePresence('/integrations');
  const [newIntegration, setNewIntegration] = useState({
    type: "jira" as "jira" | "github",
    name: "",
    url: "",
    apiToken: "",
    repository: "",
    organization: "",
  });

  useEffect(() => {
    checkAuthAndFetchProjects();
  }, []);

  const checkAuthAndFetchProjects = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access integrations",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    fetchProjects();
  };

  useEffect(() => {
    if (selectedProject) {
      fetchIntegrations();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setProjects(data || []);
    if (data && data.length > 0) {
      setSelectedProject(data[0].id);
    }
    setIsLoading(false);
  };

  const fetchIntegrations = async () => {
    if (!selectedProject) return;

    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("project_id", selectedProject)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
      return;
    }

    setIntegrations((data || []) as Integration[]);
  };

  const handleAddIntegration = async () => {
    if (!selectedProject || !newIntegration.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const config: any = {};
    if (newIntegration.type === "jira") {
      config.url = newIntegration.url;
      config.apiToken = newIntegration.apiToken;
    } else {
      config.repository = newIntegration.repository;
      config.organization = newIntegration.organization;
      config.apiToken = newIntegration.apiToken;
    }

    const { error } = await supabase.from("integrations").insert({
      project_id: selectedProject,
      integration_type: newIntegration.type,
      name: newIntegration.name,
      config,
      is_active: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add integration",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Integration added successfully",
    });

    setIsAddingNew(false);
    setNewIntegration({
      type: "jira",
      name: "",
      url: "",
      apiToken: "",
      repository: "",
      organization: "",
    });
    fetchIntegrations();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("integrations")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
      return;
    }

    fetchIntegrations();
  };

  const handleDeleteIntegration = async (id: string) => {
    const { error } = await supabase.from("integrations").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Integration deleted successfully",
    });

    fetchIntegrations();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Integrations
            </h1>
            <p className="text-muted-foreground">
              Connect your projects to Jira and GitHub for seamless workflow automation
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading projects...</p>
              </CardContent>
            </Card>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No projects found. You need to be assigned to a project to manage integrations.
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <Label htmlFor="project-select">Select Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger id="project-select" className="max-w-md">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

          {!isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)} className="mb-6 gap-2">
              <Plus className="w-4 h-4" />
              Add Integration
            </Button>
          )}

          {isAddingNew && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Integration</CardTitle>
                <CardDescription>
                  Configure a new Jira or GitHub integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="integration-type">Integration Type</Label>
                  <Select
                    value={newIntegration.type}
                    onValueChange={(value: "jira" | "github") =>
                      setNewIntegration({ ...newIntegration, type: value })
                    }
                  >
                    <SelectTrigger id="integration-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jira">Jira</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integration-name">Name</Label>
                  <Input
                    id="integration-name"
                    value={newIntegration.name}
                    onChange={(e) =>
                      setNewIntegration({ ...newIntegration, name: e.target.value })
                    }
                    placeholder="e.g., Main Jira Workspace"
                  />
                </div>

                {newIntegration.type === "jira" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="jira-url">Jira URL</Label>
                      <Input
                        id="jira-url"
                        value={newIntegration.url}
                        onChange={(e) =>
                          setNewIntegration({ ...newIntegration, url: e.target.value })
                        }
                        placeholder="https://your-domain.atlassian.net"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jira-token">API Token</Label>
                      <Input
                        id="jira-token"
                        type="password"
                        value={newIntegration.apiToken}
                        onChange={(e) =>
                          setNewIntegration({ ...newIntegration, apiToken: e.target.value })
                        }
                        placeholder="Your Jira API token"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="github-org">Organization</Label>
                      <Input
                        id="github-org"
                        value={newIntegration.organization}
                        onChange={(e) =>
                          setNewIntegration({
                            ...newIntegration,
                            organization: e.target.value,
                          })
                        }
                        placeholder="organization-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github-repo">Repository</Label>
                      <Input
                        id="github-repo"
                        value={newIntegration.repository}
                        onChange={(e) =>
                          setNewIntegration({
                            ...newIntegration,
                            repository: e.target.value,
                          })
                        }
                        placeholder="repository-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github-token">Access Token</Label>
                      <Input
                        id="github-token"
                        type="password"
                        value={newIntegration.apiToken}
                        onChange={(e) =>
                          setNewIntegration({ ...newIntegration, apiToken: e.target.value })
                        }
                        placeholder="Your GitHub access token"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddIntegration}>Add Integration</Button>
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {integrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No integrations configured yet. Add your first integration to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {integration.integration_type === "jira" ? (
                          <Network className="w-6 h-6 text-primary" />
                        ) : (
                          <Github className="w-6 h-6 text-primary" />
                        )}
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {integration.integration_type} Integration
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${integration.id}`}>Active</Label>
                          <Switch
                            id={`active-${integration.id}`}
                            checked={integration.is_active}
                            onCheckedChange={() =>
                              handleToggleActive(integration.id, integration.is_active)
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteIntegration(integration.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {integration.integration_type === "jira" && integration.config.url && (
                        <p>URL: {integration.config.url}</p>
                      )}
                      {integration.integration_type === "github" && (
                        <>
                          {integration.config.organization && (
                            <p>Organization: {integration.config.organization}</p>
                          )}
                          {integration.config.repository && (
                            <p>Repository: {integration.config.repository}</p>
                          )}
                        </>
                      )}
                      <p className="text-xs">
                        Added: {new Date(integration.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Integrations;
