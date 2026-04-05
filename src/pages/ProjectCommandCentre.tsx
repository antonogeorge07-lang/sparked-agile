import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, AlertCircle, LayoutDashboard, Kanban, Shield, Lightbulb, FileText, FlaskConical, MessageSquare, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/LoadingState";
import { StageColumn } from "@/components/command-centre/StageColumn";
import { CommandPanel } from "@/components/command-centre/CommandPanel";
import { AIInsights } from "@/components/command-centre/AIInsights";
import { ControlDeck } from "@/components/command-centre/ControlDeck";
import { RiskRegister } from "@/components/command-centre/RiskRegister";
import { LessonsLearned } from "@/components/command-centre/LessonsLearned";
import { AIInsightPlaceholders } from "@/components/command-centre/AIInsightPlaceholders";
import { CreateProjectDialog } from "@/components/command-centre/CreateProjectDialog";
import { CreateTaskDialog } from "@/components/command-centre/CreateTaskDialog";
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from "@dnd-kit/core";
import { TaskCard } from "@/components/command-centre/TaskCard";
import { ProjectMemberManager } from "@/components/ProjectMemberManager";
import { Card, CardContent } from "@/components/ui/card";
import { TestScenarioGenerator } from "@/components/TestScenarioGenerator";
import { MeetingNotesProcessor } from "@/components/MeetingNotesProcessor";
import { ResourceForecastPanel } from "@/components/ResourceForecastPanel";
import { SmartNudgesPanel } from "@/components/SmartNudgesPanel";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const PMI_STAGES = [
  { id: "initiation", title: "Initiation", color: "from-blue-500 to-cyan-500" },
  { id: "planning", title: "Planning", color: "from-purple-500 to-pink-500" },
  { id: "execution", title: "Execution", color: "from-orange-500 to-amber-500" },
  { id: "monitoring", title: "Monitoring & Control", color: "from-green-500 to-emerald-500" },
  { id: "closure", title: "Closure", color: "from-red-500 to-rose-500" }
];

interface Task {
  id: string;
  title: string;
  description: string | null;
  owner: string | null;
  start_date: string | null;
  due_date: string | null;
  status: string;
  stage: string;
  notes: string | null;
  dependencies: string[] | null;
  progress: number;
  position: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProjectCommandCentre() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      await loadProjects();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load PMI projects for this user
      const { data, error } = await supabase
        .from("pmi_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error: any) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const loadTasks = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from("pmi_tasks")
        .select("*")
        .eq("project_id", selectedProject)
        .order("position", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const newStage = over.id.toString();
    
    try {
      const { error } = await supabase
        .from("pmi_tasks")
        .update({ stage: newStage })
        .eq("id", activeTask.id);

      if (error) throw error;

      setTasks(prev => prev.map(task =>
        task.id === activeTask.id ? { ...task, stage: newStage } : task
      ));

      toast.success("Task moved successfully");
    } catch (error: any) {
      console.error("Error moving task:", error);
      toast.error("Failed to move task");
    }
  };

  const getFilteredTasks = () => {
    if (!activeFilter) return tasks;

    const now = new Date();
    switch (activeFilter) {
      case "overdue":
        return tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "Completed");
      case "blocked":
        return tasks.filter(t => t.status === "Spillover");
      case "upcoming":
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return tasks.filter(t => t.due_date && new Date(t.due_date) <= weekFromNow && t.status !== "Completed");
      default:
        return tasks;
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  if (loading) {
    return <LoadingState message="Loading Project Command Centre..." />;
  }

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>Command Centre - SAAI</title>
        <meta name="description" content="Your centralised project command centre with tasks, insights, and team collaboration." />
      </Helmet>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Project Command Centre
            </h1>
            <p className="text-muted-foreground">Built for Traditional Project Management • Futuristic, AI-Ready Design</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => setShowCreateProject(true)} variant="outline" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button onClick={() => setShowCreateTask(true)} size="lg" disabled={!selectedProject}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first project to get started</p>
            <Button onClick={() => setShowCreateProject(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full lg:w-auto flex-wrap justify-center">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="board" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <Kanban className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Task Board</span>
                <span className="sm:hidden text-[10px]">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="risks" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Risks</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Lessons</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="test-scenarios" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <FlaskConical className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Tests</span>
              </TabsTrigger>
              <TabsTrigger value="meeting-notes" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Meetings</span>
              </TabsTrigger>
              <TabsTrigger value="forecast" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Forecast</span>
              </TabsTrigger>
            </TabsList>

            {/* Project Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <CommandPanel
                    projects={projects}
                    selectedProject={selectedProject}
                    onProjectChange={setSelectedProject}
                    tasks={tasks}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                  
                  {selectedProject && currentProject && (
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{currentProject.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                        <div className="mt-4">
                          <ProjectMemberManager
                            projectId={selectedProject}
                            projectName={currentProject.name}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                  
                  <AIInsights
                    projectId={selectedProject}
                    projectName={currentProject?.name || ""}
                    taskCount={tasks.length}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Task Board Tab */}
            <TabsContent value="board">
              <div className="flex gap-6">
                <div className="flex-1">
                  <DndContext
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {PMI_STAGES.map(stage => (
                        <StageColumn
                          key={stage.id}
                          stage={stage}
                          tasks={getFilteredTasks().filter(t => t.stage === stage.id)}
                          onTaskUpdate={loadTasks}
                        />
                      ))}
                    </div>

                    <DragOverlay>
                      {activeTask ? (
                        <div className="transform rotate-2 opacity-90">
                          <TaskCard task={activeTask} onUpdate={loadTasks} />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>

                <div className="w-80 space-y-4">
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                  <AIInsightPlaceholders />
                </div>
              </div>
            </TabsContent>

            {/* Risk Register Tab */}
            <TabsContent value="risks">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RiskRegister projectId={selectedProject} />
                </div>
                <div>
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                </div>
              </div>
            </TabsContent>

            {/* Lessons Learned Tab */}
            <TabsContent value="lessons">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LessonsLearned projectId={selectedProject} />
                </div>
                <div>
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                </div>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-2">
                    <CardContent className="py-12 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Executive Reports</h3>
                      <p className="text-muted-foreground mb-6">
                        Comprehensive project reports and analytics coming soon
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4">
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                  <AIInsightPlaceholders />
                </div>
              </div>
            </TabsContent>

            {/* Test Scenarios Tab */}
            <TabsContent value="test-scenarios">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <TestScenarioGenerator projectId={selectedProject} />
                </div>
                <div className="space-y-4">
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                  <SmartNudgesPanel projectId={selectedProject} />
                </div>
              </div>
            </TabsContent>

            {/* Meeting Notes Tab */}
            <TabsContent value="meeting-notes">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MeetingNotesProcessor projectId={selectedProject} />
                </div>
                <div className="space-y-4">
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                  <SmartNudgesPanel projectId={selectedProject} />
                </div>
              </div>
            </TabsContent>

            {/* Resource Forecast Tab */}
            <TabsContent value="forecast">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ResourceForecastPanel projectId={selectedProject} />
                </div>
                <div className="space-y-4">
                  <ControlDeck projectId={selectedProject} tasks={tasks} />
                  <SmartNudgesPanel projectId={selectedProject} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onSuccess={() => {
          loadProjects();
          setShowCreateProject(false);
        }}
      />

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        projectId={selectedProject}
        onSuccess={() => {
          loadTasks();
          setShowCreateTask(false);
        }}
      />
    </div>
  );
}
