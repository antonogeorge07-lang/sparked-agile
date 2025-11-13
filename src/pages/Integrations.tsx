import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Github, Network, Plus, Trash2, Settings, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { ActiveUsers } from "@/components/ActiveUsers";
import { useUserRole } from "@/hooks/useUserRole";
import { z } from "zod";
import { ConnectionStatus } from "@/components/integrations/ConnectionStatus";
import { IntegrationWizard } from "@/components/integrations/IntegrationWizard";
import { ConnectionTester } from "@/components/integrations/ConnectionTester";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationCard } from "@/components/IntegrationCard";

// Validation schemas
const jiraConfigSchema = z.object({
  url: z.string().url({ message: "Invalid URL format" }).max(500, "URL too long"),
  apiToken: z.string().min(10, "API token too short").max(500, "API token too long"),
});

const githubConfigSchema = z.object({
  repository: z.string().min(1, "Repository required").max(200, "Repository name too long").regex(/^[a-zA-Z0-9_-]+$/, "Invalid repository name format"),
  organization: z.string().min(1, "Organization required").max(200, "Organization name too long").regex(/^[a-zA-Z0-9_-]+$/, "Invalid organization name format"),
  apiToken: z.string().min(10, "API token too short").max(500, "API token too long"),
});

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
  updated_at: string;
}

interface IntegrationWithStatus extends Integration {
  status: "connected" | "disconnected" | "testing" | "error" | "warning";
  lastSync?: string;
  statusMessage?: string;
}

const Integrations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<IntegrationWithStatus[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [useWizard, setUseWizard] = useState(true);
  const [selectedType, setSelectedType] = useState<"jira" | "github">("jira");
  const [isLoading, setIsLoading] = useState(true);
  const { activeUsers } = useRealtimePresence('/integrations');
  const { role, loading: roleLoading, isPending } = useUserRole();
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

    // Don't block pending users, but they won't see projects they're not allocated to
    fetchProjects();
  };

  useEffect(() => {
    if (selectedProject) {
      fetchIntegrations();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setIsLoading(true);
    
    // Query projects - RLS will automatically filter to only show projects user has access to
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please check your permissions.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setProjects(data || []);
    if (data && data.length > 0) {
      setSelectedProject(data[0].id);
    } else {
      // User has no project access
      console.log("No projects found for user");
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

    // Add status information to integrations
    const integrationsWithStatus: IntegrationWithStatus[] = (data || []).map((integration) => {
      const config = integration.config as any;
      
      // Determine status based on activity and config
      let status: "connected" | "disconnected" | "error" | "warning" = "disconnected";
      let statusMessage = "";

      if (integration.is_active) {
        // Check if configuration looks valid
        if (integration.integration_type === "jira") {
          if (config?.url && config?.apiToken) {
            status = "connected";
            statusMessage = "Active and configured";
          } else {
            status = "warning";
            statusMessage = "Missing configuration";
          }
        } else {
          if (config?.organization && config?.repository && config?.apiToken) {
            status = "connected";
            statusMessage = "Active and configured";
          } else {
            status = "warning";
            statusMessage = "Missing configuration";
          }
        }
      } else {
        status = "disconnected";
        statusMessage = "Integration is disabled";
      }

      return {
        ...integration,
        integration_type: integration.integration_type as "jira" | "github",
        config: config,
        status,
        statusMessage,
        lastSync: integration.updated_at,
      };
    });

    setIntegrations(integrationsWithStatus);
  };

  // Unified function to add integration - used by both wizard and advanced flows
  const addIntegration = async (
    type: "jira" | "github",
    name: string,
    configData: {
      url?: string;
      apiToken?: string;
      repository?: string;
      organization?: string;
    }
  ) => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "No project selected",
        variant: "destructive",
      });
      return false;
    }

    if (!name || name.trim().length === 0) {
      toast({
        title: "Error",
        description: "Please provide an integration name",
        variant: "destructive",
      });
      return false;
    }

    if (name.length > 200) {
      toast({
        title: "Validation Error",
        description: "Integration name must be less than 200 characters",
        variant: "destructive",
      });
      return false;
    }

    try {
      let config: any = {};
      
      // Validate based on integration type
      if (type === "jira") {
        const validationResult = jiraConfigSchema.safeParse({
          url: configData.url,
          apiToken: configData.apiToken,
        });

        if (!validationResult.success) {
          const errorMessage = validationResult.error.issues[0]?.message || "Invalid Jira configuration";
          toast({
            title: "Validation Error",
            description: errorMessage,
            variant: "destructive",
          });
          return false;
        }

        config = validationResult.data;
      } else {
        const validationResult = githubConfigSchema.safeParse({
          repository: configData.repository,
          organization: configData.organization,
          apiToken: configData.apiToken,
        });

        if (!validationResult.success) {
          const errorMessage = validationResult.error.issues[0]?.message || "Invalid GitHub configuration";
          toast({
            title: "Validation Error",
            description: errorMessage,
            variant: "destructive",
          });
          return false;
        }

        config = validationResult.data;
      }

      const { error } = await supabase.from("integrations").insert({
        project_id: selectedProject,
        integration_type: type,
        name: name,
        config,
        is_active: true,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add integration",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${type === "jira" ? "Jira" : "GitHub"} integration added successfully`,
      });

      await fetchIntegrations();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleWizardComplete = async (wizardData: any) => {
    const success = await addIntegration(selectedType, wizardData.name, {
      url: wizardData.url,
      apiToken: wizardData.apiToken,
      repository: wizardData.repository,
      organization: wizardData.organization,
    });

    if (success) {
      setIsAddingNew(false);
      setUseWizard(true);
    }
  };

  const handleAddIntegration = async () => {
    const success = await addIntegration(newIntegration.type, newIntegration.name, {
      url: newIntegration.url,
      apiToken: newIntegration.apiToken,
      repository: newIntegration.repository,
      organization: newIntegration.organization,
    });

    if (success) {
      setIsAddingNew(false);
      setNewIntegration({
        type: "jira",
        name: "",
        url: "",
        apiToken: "",
        repository: "",
        organization: "",
      });
    }
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
          <BackButton className="mb-4" />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Integrations
            </h1>
            <p className="text-muted-foreground">
              Connect your projects to Jira and GitHub for seamless workflow automation
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 max-w-md" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {isPending ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Account Pending Approval</h3>
                    <p className="text-muted-foreground mb-4">
                      Your account is awaiting admin approval. Once approved and allocated to a project, you'll be able to manage integrations.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">No Project Access</h3>
                    <p className="text-muted-foreground mb-4">
                      You need to be assigned to a project to manage integrations. Contact your admin to request project access.
                    </p>
                  </>
                )}
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
            <div className="flex gap-2">
              <Button onClick={() => { setIsAddingNew(true); setUseWizard(true); setSelectedType("jira"); }} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Integration (Wizard)
              </Button>
              <Button variant="outline" onClick={() => { setIsAddingNew(true); setUseWizard(false); }} className="gap-2">
                <Settings className="w-4 h-4" />
                Advanced Setup
              </Button>
            </div>
          )}

          {isAddingNew && useWizard && (
            <IntegrationWizard
              type={selectedType}
              onComplete={handleWizardComplete}
              onCancel={() => { setIsAddingNew(false); setUseWizard(true); }}
            />
          )}

          {isAddingNew && !useWizard && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Integration (Advanced)</CardTitle>
                <CardDescription>
                  Configure a new Jira or GitHub integration manually
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
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteIntegration}
                  onTestComplete={(success, message) => {
                    if (success) {
                      toast({
                        title: "Connection Successful",
                        description: message,
                      });
                    } else {
                      toast({
                        title: "Connection Failed",
                        description: message,
                        variant: "destructive",
                      });
                    }
                  }}
                />
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
