import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function ValueStreams() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [valueStreams, setValueStreams] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newStreamName, setNewStreamName] = useState("");
  const [newStreamDesc, setNewStreamDesc] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadValueStreams();
    }
  }, [selectedProject]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    }
  };

  const loadValueStreams = async () => {
    if (!selectedProject) return;

    const { data, error } = await supabase
      .from('value_streams')
      .select('*, agile_release_trains(count)')
      .eq('project_id', selectedProject)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading value streams:', error);
    } else {
      setValueStreams(data || []);
    }
  };

  const createValueStream = async () => {
    if (!newStreamName || !selectedProject) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the value stream",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const { error } = await supabase
      .from('value_streams')
      .insert({
        name: newStreamName,
        description: newStreamDesc,
        project_id: selectedProject
      });

    setIsCreating(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create value stream",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Value stream created successfully",
      });
      setNewStreamName("");
      setNewStreamDesc("");
      loadValueStreams();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Value Streams - SAAI</title>
        <meta name="description" content="Map and optimise value streams with flow metrics and bottleneck identification." />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Value Stream Management</h1>
              <p className="text-muted-foreground">Define and manage your organization's value streams</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Create Value Stream</CardTitle>
                <CardDescription>Define a new value stream to accelerate flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select 
                    value={selectedProject || ""} 
                    onValueChange={setSelectedProject}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="name">Value Stream Name</Label>
                  <Input
                    id="name"
                    placeholder="Customer Portal"
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="End-to-end value delivery for customer-facing features"
                    value={newStreamDesc}
                    onChange={(e) => setNewStreamDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={createValueStream} 
                  disabled={isCreating}
                  className="w-full gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Value Stream
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Value Streams</CardTitle>
                <CardDescription>Organize work around continuous value delivery</CardDescription>
              </CardHeader>
              <CardContent>
                {valueStreams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No value streams yet. Create one to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {valueStreams.map((stream) => (
                      <div key={stream.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <h4 className="font-semibold mb-1">{stream.name}</h4>
                        {stream.description && (
                          <p className="text-sm text-muted-foreground mb-2">{stream.description}</p>
                        )}
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>ARTs: {stream.agile_release_trains?.[0]?.count || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}