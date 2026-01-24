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
  RefreshCw
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StakeholderWidgetCard } from "@/components/stakeholder/StakeholderWidgetCard";
import { ApprovalRequestsList } from "@/components/stakeholder/ApprovalRequestsList";
import { DigestSubscriptionManager } from "@/components/stakeholder/DigestSubscriptionManager";
import { AlertsConfigPanel } from "@/components/stakeholder/AlertsConfigPanel";

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
    opacity: isDragging ? 0.5 : 1,
  };

  const widgetInfo = WIDGET_TYPES.find(w => w.type === widget.widget_type);

  return (
    <div ref={setNodeRef} style={style} className={`${!widget.is_visible ? 'opacity-50' : ''}`}>
      <Card className="relative">
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-3 left-3 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8"
          onClick={() => onToggleVisibility(widget.id, !widget.is_visible)}
        >
          {widget.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        
        {widget.is_visible && (
          <StakeholderWidgetCard 
            widgetType={widget.widget_type} 
            projectId={projectId}
            config={widget.config}
          />
        )}
        
        {!widget.is_visible && (
          <CardHeader className="pl-10">
            <CardTitle className="text-lg flex items-center gap-2">
              {widgetInfo && <widgetInfo.icon className="h-5 w-5" />}
              {widgetInfo?.label || widget.widget_type}
            </CardTitle>
            <CardDescription>Widget hidden - click eye icon to show</CardDescription>
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                Stakeholder Portal
              </h1>
              <p className="text-muted-foreground">
                Personalized insights, approvals, and executive digests
              </p>
            </div>
          </div>

          {pendingApprovals > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              <Bell className="h-4 w-4 mr-2" />
              {pendingApprovals} Pending Approval{pendingApprovals > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Project Selector */}
        {projects.length > 1 && (
          <div className="mb-6">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background"
            >
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="w-full lg:w-auto flex-wrap">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingApprovals}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="digests" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email Digests</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Dashboard</h2>
              <div className="flex gap-2">
                {WIDGET_TYPES.filter(wt => !widgets.some(w => w.widget_type === wt.type)).length > 0 && (
                  <select
                    className="px-3 py-2 border rounded-lg text-sm"
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

            <p className="text-sm text-muted-foreground mb-6">
              Drag widgets to reorder. Click the eye icon to show/hide.
            </p>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <Card className="p-12 text-center">
                <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No widgets configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add widgets to customize your stakeholder dashboard
                </p>
                <Button onClick={() => addWidget('velocity_trend')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Widget
                </Button>
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