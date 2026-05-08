import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Edit, CheckCircle2, Circle } from "lucide-react";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface JiraIssue {
  key: string;
  summary: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  issueType?: string;
  labels?: string[];
  url: string;
}

interface GithubIssue {
  id: number;
  title: string;
  description?: string;
  status: string;
  labels?: string[];
  assignee?: string;
  url: string;
}

const TaskManagement = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", status: "" });
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Check integrations
  const { data: integrations } = useProjectIntegrations(selectedProjectId);

  // Fetch JIRA issues using projectId directly
  const { data: jiraData, isLoading: jiraLoading } = useQuery({
    queryKey: ["jira-issues", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId || !integrations?.hasJira) return { backlogItems: [] };

      const { data, error } = await supabase.functions.invoke("fetch-jira-backlog", {
        body: { projectId: selectedProjectId },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId && !!integrations?.hasJira,
  });

  // Fetch GitHub issues using projectId directly
  const { data: githubData, isLoading: githubLoading } = useQuery({
    queryKey: ["github-issues", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId || !integrations?.hasGithub) return { issues: [] };

      const { data, error } = await supabase.functions.invoke("fetch-github-issues", {
        body: { projectId: selectedProjectId },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProjectId && !!integrations?.hasGithub,
  });

  // Update JIRA issue mutation
  const updateJiraMutation = useMutation({
    mutationFn: async ({ issueKey, updates }: { issueKey: string; updates: any }) => {
      const { data, error } = await supabase.functions.invoke("update-jira-issue", {
        body: { projectId: selectedProjectId, issueKey, updates },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "JIRA issue updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["jira-issues"] });
      setEditingTask(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update JIRA issue", description: error.message, variant: "destructive" });
    },
  });

  // Update GitHub issue mutation
  const updateGithubMutation = useMutation({
    mutationFn: async ({ issueNumber, updates }: { issueNumber: number; updates: any }) => {
      const { data, error } = await supabase.functions.invoke("update-github-issue", {
        body: { projectId: selectedProjectId, issueNumber, updates },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "GitHub issue updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["github-issues"] });
      setEditingTask(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update GitHub issue", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (task: any, type: 'jira' | 'github') => {
    setEditingTask({ ...task, type });
    setEditForm({
      title: type === 'jira' ? task.summary : task.title,
      description: task.description || "",
      status: task.status,
    });
  };

  const handleUpdate = () => {
    if (!editingTask) return;

    if (editingTask.type === 'jira') {
      updateJiraMutation.mutate({
        issueKey: editingTask.key,
        updates: {
          summary: editForm.title,
          description: editForm.description,
          status: editForm.status,
        },
      });
    } else {
      updateGithubMutation.mutate({
        issueNumber: editingTask.id,
        updates: {
          title: editForm.title,
          body: editForm.description,
          state: editForm.status,
        },
      });
    }
  };

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Task Management - Spark-Agile</title>
        <meta name="description" content="Manage tasks with Kanban boards, priorities, and team assignments." />
      </Helmet>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("pages.taskManagement.title")}</h1>
          <p className="text-muted-foreground">
            Manage your JIRA and GitHub tasks from one place
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Project</label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!integrations?.hasJira && !integrations?.hasGithub && (
          <Card>
            <CardHeader>
              <CardTitle>No Integrations Configured</CardTitle>
              <CardDescription>
                Please configure JIRA or GitHub integrations to manage tasks
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {(integrations?.hasJira || integrations?.hasGithub) && (
          <Tabs defaultValue="jira" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jira" disabled={!integrations?.hasJira}>
                JIRA Tasks
              </TabsTrigger>
              <TabsTrigger value="github" disabled={!integrations?.hasGithub}>
                GitHub Issues
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jira">
              {jiraLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {jiraData?.backlogItems?.map((issue: JiraIssue) => (
                    <Card key={issue.key}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{issue.summary}</CardTitle>
                            <CardDescription>{issue.key}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(issue, 'jira')}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit JIRA Issue</DialogTitle>
                                  <DialogDescription>Update the issue details</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                      value={editForm.title}
                                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                      value={editForm.description}
                                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                  </div>
                                  <Button onClick={handleUpdate} disabled={updateJiraMutation.isPending}>
                                    {updateJiraMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Issue
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" asChild>
                              <a href={issue.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {issue.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{issue.status}</Badge>
                            {issue.priority && <Badge variant="outline">{issue.priority}</Badge>}
                            {issue.issueType && <Badge variant="outline">{issue.issueType}</Badge>}
                            {issue.labels?.map((label) => (
                              <Badge key={label} variant="outline">{label}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="github">
              {githubLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {githubData?.issues?.map((issue: GithubIssue) => (
                    <Card key={issue.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {issue.status === 'open' ? (
                                <Circle className="h-4 w-4 text-green-500" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                              )}
                              {issue.title}
                            </CardTitle>
                            <CardDescription>#{issue.id}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(issue, 'github')}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit GitHub Issue</DialogTitle>
                                  <DialogDescription>Update the issue details</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                      value={editForm.title}
                                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                      value={editForm.description}
                                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={handleUpdate} disabled={updateGithubMutation.isPending}>
                                    {updateGithubMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Issue
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" asChild>
                              <a href={issue.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {issue.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={issue.status === 'open' ? 'default' : 'secondary'}>
                              {issue.status}
                            </Badge>
                            {issue.labels?.map((label) => (
                              <Badge key={label} variant="outline">{label}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default TaskManagement;
