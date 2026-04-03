import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Calendar, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CreateEpicDialog } from "@/components/epic/CreateEpicDialog";
import { EpicTimeline } from "@/components/epic/EpicTimeline";
import { EpicGanttChart } from "@/components/epic/EpicGanttChart";
import { useTranslation } from "react-i18next";

export default function EpicManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [valueStreams, setValueStreams] = useState<any[]>([]);
  const [selectedValueStream, setSelectedValueStream] = useState<string>("all");
  const [epics, setEpics] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      loadProjects();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadValueStreams();
      loadEpics();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      loadEpics();
    }
  }, [selectedValueStream, selectedStatus, selectedPriority]);

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
      .select('*')
      .eq('project_id', selectedProject)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading value streams:', error);
    } else {
      setValueStreams(data || []);
    }
  };

  const loadEpics = async () => {
    if (!selectedProject) return;

    setLoading(true);
    let query = supabase
      .from('epics')
      .select(`
        *,
        value_streams!inner(id, name, project_id),
        features(count)
      `)
      .eq('value_streams.project_id', selectedProject)
      .order('created_at', { ascending: false });

    if (selectedValueStream !== "all") {
      query = query.eq('value_stream_id', selectedValueStream);
    }

    if (selectedStatus !== "all") {
      query = query.eq('status', selectedStatus);
    }

    if (selectedPriority !== "all") {
      query = query.eq('priority', selectedPriority);
    }

    const { data, error } = await query;

    setLoading(false);

    if (error) {
      console.error('Error loading epics:', error);
      toast({
        title: "Error",
        description: "Failed to load epics",
        variant: "destructive",
      });
    } else {
      setEpics(data || []);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'in_progress': return 'bg-primary/10 text-primary';
      case 'planning': return 'bg-warning/10 text-warning';
      case 'backlog': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'on_track': return 'text-success';
      case 'at_risk': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <BackButton />

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold page-header-gradient mb-2">{t("pages.epicManagement.title")}</h1>
                <p className="text-muted-foreground">
                  {t("pages.epicManagement.createTrackManage")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate("/value-streams")}
                  variant="outline"
                  size="lg"
                >
                  <Target className="mr-2 h-5 w-5" />
                  {t("pages.epicManagement.manageValueStreams")}
                </Button>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)} 
                  size="lg"
                  disabled={valueStreams.length === 0}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t("pages.epicManagement.createEpic")}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.epicManagement.selectProject")} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedValueStream} onValueChange={setSelectedValueStream}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.epicManagement.allValueStreams")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("pages.epicManagement.allValueStreams")}</SelectItem>
                  {valueStreams.map(vs => (
                    <SelectItem key={vs.id} value={vs.id}>
                      {vs.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.epicManagement.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("pages.epicManagement.allStatuses")}</SelectItem>
                  <SelectItem value="backlog">{t("pages.epicManagement.backlog")}</SelectItem>
                  <SelectItem value="planning">{t("pages.epicManagement.planning")}</SelectItem>
                  <SelectItem value="in_progress">{t("pages.epicManagement.inProgress")}</SelectItem>
                  <SelectItem value="completed">{t("pages.epicManagement.completed")}</SelectItem>
                  <SelectItem value="archived">{t("pages.epicManagement.archived")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.epicManagement.allPriorities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("pages.epicManagement.allPriorities")}</SelectItem>
                  <SelectItem value="critical">{t("pages.epicManagement.critical")}</SelectItem>
                  <SelectItem value="high">{t("pages.epicManagement.high")}</SelectItem>
                  <SelectItem value="medium">{t("pages.epicManagement.medium")}</SelectItem>
                  <SelectItem value="low">{t("pages.epicManagement.low")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Epic Views with Tabs */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("pages.epicManagement.loadingEpics")}</p>
            </div>
          ) : valueStreams.length === 0 && selectedProject ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("pages.epicManagement.noValueStreams")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("pages.epicManagement.noValueStreamsDesc")}
                </p>
                <Button onClick={() => navigate("/value-streams")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("pages.epicManagement.createValueStream")}
                </Button>
              </CardContent>
            </Card>
          ) : epics.length === 0 && selectedProject ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("pages.epicManagement.noEpics")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("pages.epicManagement.noEpicsDesc")}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} disabled={valueStreams.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("pages.epicManagement.createEpic")}
                </Button>
              </CardContent>
            </Card>
          ) : selectedProject ? (
            <Tabs defaultValue="board" className="space-y-6">
              <TabsList>
                <TabsTrigger value="board">{t("pages.epicManagement.boardView")}</TabsTrigger>
                <TabsTrigger value="timeline">{t("pages.epicManagement.timelineView")}</TabsTrigger>
                <TabsTrigger value="gantt">{t("pages.epicManagement.ganttChart")}</TabsTrigger>
              </TabsList>

              <TabsContent value="board">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {epics.map(epic => (
                    <Card 
                      key={epic.id} 
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4"
                      style={{ borderLeftColor: epic.color_hex }}
                      onClick={() => navigate(`/epic/${epic.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={getPriorityColor(epic.priority)}>
                            {epic.priority?.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(epic.status)}>
                            {epic.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{epic.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {epic.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Target className="h-4 w-4 mr-2" />
                            {epic.value_streams?.name}
                          </div>

                          {epic.business_value && (
                            <div className="flex items-center text-sm">
                              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                              <span>{t("pages.epicManagement.businessValue")}: {epic.business_value}/100</span>
                            </div>
                          )}

                          {epic.features && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              {epic.features[0]?.count || 0} {t("pages.epicManagement.features")}
                            </div>
                          )}

                          {(epic.start_date || epic.end_date) && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              {epic.start_date && new Date(epic.start_date).toLocaleDateString()}
                              {epic.start_date && epic.end_date && ' - '}
                              {epic.end_date && new Date(epic.end_date).toLocaleDateString()}
                            </div>
                          )}

                          {epic.health_score && (
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-muted-foreground">Health</span>
                              <span className={`text-sm font-semibold ${getHealthColor(epic.health_score)}`}>
                                {epic.health_score.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <EpicTimeline projectId={selectedProject} />
              </TabsContent>

              <TabsContent value="gantt">
                <EpicGanttChart projectId={selectedProject!} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                <p className="text-muted-foreground">
                  Choose a project from the dropdown to view its epics
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateEpicDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={selectedProject}
        valueStreams={valueStreams}
        onSuccess={() => {
          loadEpics();
          toast({
            title: "Success",
            description: "Epic created successfully",
          });
        }}
      />
    </>
  );
}
