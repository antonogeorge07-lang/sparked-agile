import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Bell, 
  CheckCircle2, 
  Mail, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Target,
  Calendar,
  FileText,
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  UserPlus
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StakeholderWidgetCard } from "@/components/stakeholder/StakeholderWidgetCard";
import { ApprovalRequestsList } from "@/components/stakeholder/ApprovalRequestsList";
import { DigestSubscriptionManager } from "@/components/stakeholder/DigestSubscriptionManager";
import { AlertsConfigPanel } from "@/components/stakeholder/AlertsConfigPanel";
import { StakeholderInviteForm } from "@/components/stakeholder/StakeholderInviteForm";

interface WidgetConfig {
  id: string;
  widget_type: string;
  position: number;
  is_visible: boolean | null;
  config: any;
  project_id?: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const WIDGET_TYPES = [
  { type: 'velocity_trend', label: 'Velocity Trend', icon: TrendingUp, description: 'Sprint velocity over time' },
  { type: 'epic_roi', label: 'Epic ROI', icon: Target, description: 'Return on investment by epic' },
  { type: 'milestone_tracker', label: 'Milestone Tracker', icon: Calendar, description: 'Upcoming milestones status' },
  { type: 'risk_heatmap', label: 'Risk Heatmap', icon: AlertTriangle, description: 'Project risk visualization' },
  { type: 'sprint_progress', label: 'Sprint Progress', icon: LayoutDashboard, description: 'Current sprint completion' },
  { type: 'team_velocity', label: 'Team Velocity', icon: TrendingUp, description: 'Team performance metrics' },
  { type: 'blockers_summary', label: 'Blockers Summary', icon: AlertTriangle, description: 'Active blockers across projects' },
  { type: 'completion_rate', label: 'Completion Rate', icon: CheckCircle2, description: 'Story completion percentage' },
];

function SortableWidget({ widget, onToggleVisibility, projectId }: { 
  widget: WidgetConfig; 
  onToggleVisibility: (id: string, visible: boolean) => void;
  projectId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const widgetInfo = WIDGET_TYPES.find(w => w.type === widget.widget_type);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group transition-all duration-300 ${isDragging ? 'scale-105 z-50' : ''} ${!widget.is_visible ? 'opacity-60' : ''}`}
    >
      <Card className={`
        relative overflow-hidden h-full
        bg-gradient-to-br from-card via-card to-card/80
        border border-border/50 hover:border-primary/30
        shadow-sm hover:shadow-lg hover:shadow-primary/5
        transition-all duration-300
        ${isDragging ? 'ring-2 ring-primary/50 shadow-xl shadow-primary/20' : ''}
      `}>
        {/* Decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-3 left-3 cursor-grab active:cursor-grabbing p-1.5 hover:bg-primary/10 rounded-md transition-colors z-10"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        
        {/* Visibility toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 hover:bg-primary/10 z-10"
          onClick={() => onToggleVisibility(widget.id, !widget.is_visible)}
        >
          {widget.is_visible ? (
            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        
        {widget.is_visible && (
          <StakeholderWidgetCard 
            widgetType={widget.widget_type} 
            projectId={projectId}
            config={widget.config}
          />
        )}
        
        {!widget.is_visible && (
          <CardHeader className="pl-12 pr-12">
            <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
              {widgetInfo && <widgetInfo.icon className="h-5 w-5" />}
              {widgetInfo?.label || widget.widget_type}
            </CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Widget hidden - click eye icon to show
            </CardDescription>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default function StakeholderPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && selectedProject) {
      loadWidgets();
    }
  }, [user, selectedProject]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    await loadProjects(user.id);
    await loadPendingApprovals(user.id);
    setLoading(false);
  };

  const loadProjects = async (userId: string) => {
    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id, projects(id, name)')
      .eq('user_id', userId);

    if (memberProjects) {
      const projectList = memberProjects
        .filter(mp => mp.projects)
        .map(mp => mp.projects);
      setProjects(projectList);
      if (projectList.length > 0) {
        setSelectedProject(projectList[0].id);
      }
    }
  };

  const loadWidgets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('stakeholder_widget_configs')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', selectedProject)
      .order('position');

    if (error) {
      console.error('Error loading widgets:', error);
      return;
    }

    if (data && data.length > 0) {
      setWidgets(data);
    } else {
      // Create default widgets for new users
      await createDefaultWidgets();
    }
  };

  const createDefaultWidgets = async () => {
    if (!user || !selectedProject) return;

    const defaultWidgets = WIDGET_TYPES.slice(0, 6).map((w, index) => ({
      user_id: user.id,
      project_id: selectedProject,
      widget_type: w.type,
      position: index,
      is_visible: true,
      config: {}
    }));

    const { data, error } = await supabase
      .from('stakeholder_widget_configs')
      .insert(defaultWidgets)
      .select();

    if (error) {
      console.error('Error creating default widgets:', error);
      return;
    }

    if (data) {
      setWidgets(data);
    }
  };

  const loadPendingApprovals = async (userId: string) => {
    const { count } = await supabase
      .from('approval_requests')
      .select('*', { count: 'exact', head: true })
      .eq('approver_id', userId)
      .eq('status', 'pending');

    setPendingApprovals(count || 0);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex(w => w.id === active.id);
    const newIndex = widgets.findIndex(w => w.id === over.id);

    const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex).map((w, idx) => ({
      ...w,
      position: idx
    }));

    setWidgets(reorderedWidgets);

    // Persist position changes
    for (const widget of reorderedWidgets) {
      await supabase
        .from('stakeholder_widget_configs')
        .update({ position: widget.position })
        .eq('id', widget.id);
    }
  };

  const toggleWidgetVisibility = async (widgetId: string, visible: boolean) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, is_visible: visible } : w
    ));

    await supabase
      .from('stakeholder_widget_configs')
      .update({ is_visible: visible })
      .eq('id', widgetId);
  };

  const addWidget = async (widgetType: string) => {
    if (!user || !selectedProject) return;

    const { data, error } = await supabase
      .from('stakeholder_widget_configs')
      .insert({
        user_id: user.id,
        project_id: selectedProject,
        widget_type: widgetType,
        position: widgets.length,
        is_visible: true,
        config: {}
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add widget');
      return;
    }

    if (data) {
      setWidgets([...widgets, data]);
      toast.success('Widget added');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with elegant styling */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <LayoutDashboard className="h-7 w-7 text-primary" />
                  </div>
                  Stakeholder Portal
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                  Personalized insights, approvals, and executive digests
                </p>
              </div>
            </div>

            {pendingApprovals > 0 && (
              <Badge variant="destructive" className="text-base px-4 py-2 shadow-lg shadow-destructive/20 animate-pulse">
                <Bell className="h-4 w-4 mr-2" />
                {pendingApprovals} Pending Approval{pendingApprovals > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Project Selector with improved styling */}
        {projects.length > 1 && (
          <div className="mb-8">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2.5 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="w-full lg:w-auto flex-wrap bg-muted/50 backdrop-blur-sm p-1.5 rounded-xl border border-border/30">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{pendingApprovals}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="digests" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email Digests</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="invite" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Your Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag widgets to reorder • Click the eye icon to show/hide
                </p>
              </div>
              <div className="flex gap-2">
                {WIDGET_TYPES.filter(wt => !widgets.some(w => w.widget_type === wt.type)).length > 0 && (
                  <select
                    className="px-4 py-2.5 border border-border/50 rounded-xl text-sm bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        addWidget(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Widget</option>
                    {WIDGET_TYPES
                      .filter(wt => !widgets.some(w => w.widget_type === wt.type))
                      .map(wt => (
                        <option key={wt.type} value={wt.type}>{wt.label}</option>
                      ))
                    }
                  </select>
                )}
              </div>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {widgets.map((widget) => (
                    <SortableWidget
                      key={widget.id}
                      widget={widget}
                      onToggleVisibility={toggleWidgetVisibility}
                      projectId={selectedProject}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {widgets.length === 0 && (
              <Card className="relative overflow-hidden p-16 text-center bg-gradient-to-br from-card via-card to-muted/20 border-dashed border-2 border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                <div className="relative">
                  <div className="mx-auto w-fit p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mb-6">
                    <LayoutDashboard className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No widgets configured</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Add widgets to customize your stakeholder dashboard with the metrics that matter most
                  </p>
                  <Button onClick={() => addWidget('velocity_trend')} className="shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Widget
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalRequestsList userId={user?.id} projectId={selectedProject} />
          </TabsContent>

          <TabsContent value="digests">
            <DigestSubscriptionManager 
              userId={user?.id} 
              projectId={selectedProject}
              userEmail={user?.email}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsConfigPanel userId={user?.id} projectId={selectedProject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}