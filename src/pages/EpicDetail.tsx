import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Target, Calendar, TrendingUp, Users, CheckCircle2, 
  Edit, Loader2, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { FeatureBreakdownPanel } from "@/components/epic/FeatureBreakdownPanel";
import { DependencyGraph } from "@/components/epic/DependencyGraph";
import { EpicBurndownChart } from "@/components/epic/EpicBurndownChart";
import { EpicHealthScore } from "@/components/epic/EpicHealthScore";
import { EpicMilestones } from "@/components/epic/EpicMilestones";
import { EpicVelocityMetrics } from "@/components/epic/EpicVelocityMetrics";
import { EpicClosureWorkflow } from "@/components/epic/EpicClosureWorkflow";
import { EpicImpactTracking } from "@/components/epic/EpicImpactTracking";
import { EpicROIDashboard } from "@/components/epic/EpicROIDashboard";
import { EpicLessonsLearned } from "@/components/epic/EpicLessonsLearned";
import { EpicImplementationValidator } from "@/components/epic/EpicImplementationValidator";
import { EditEpicDialog } from "@/components/epic/EditEpicDialog";
import { EpicActions } from "@/components/epic/EpicActions";

export default function EpicDetail() {
  const { id } = useParams<{ id: string }>();
  const [epic, setEpic] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [valueStreams, setValueStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      if (id) {
        await loadEpicDetails();
      }
    };
    init();
  }, [id]);

  const loadEpicDetails = async () => {
    if (!id) return;

    setLoading(true);

    try {
      // Load epic
      const { data: epicData, error: epicError } = await supabase
        .from('epics')
        .select(`
          *,
          value_streams(id, name, project_id)
        `)
        .eq('id', id)
        .maybeSingle();

      if (epicError) throw epicError;
      if (!epicData) {
        setLoading(false);
        return;
      }
      setEpic(epicData);

      // Load features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .eq('epic_id', id)
        .order('created_at', { ascending: false });

      if (featuresError) throw featuresError;
      setFeatures(featuresData || []);

      // Load stakeholders
      const { data: stakeholdersData, error: stakeholdersError } = await supabase
        .from('epic_stakeholders')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq('epic_id', id);

      if (stakeholdersError) throw stakeholdersError;
      setStakeholders(stakeholdersData || []);

      // Load value streams for edit dialog
      if (epicData?.value_streams?.project_id) {
        const { data: vsData } = await supabase
          .from('value_streams')
          .select('*')
          .eq('project_id', epicData.value_streams.project_id);
        setValueStreams(vsData || []);
      }

    } catch (error: any) {
      console.error('Error loading epic details:', error);
      toast({
        title: "Error",
        description: "Failed to load epic details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500';
      case 'planning': return 'bg-yellow-500/10 text-yellow-500';
      case 'backlog': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'on_track': return 'text-green-500';
      case 'at_risk': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <BackButton />
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!epic) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <BackButton />
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Epic Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  The epic you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => navigate('/epic-management')}>
                  Back to Epic Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const progressPercentage = features.length > 0 
    ? Math.round((completedFeatures / features.length) * 100)
    : 0;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <BackButton />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={getPriorityColor(epic.priority)}>
                    {epic.priority?.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(epic.status)}>
                    {epic.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {epic.health_score && (
                    <span className={`text-sm font-semibold ${getHealthColor(epic.health_score)}`}>
                      {epic.health_score.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">{epic.title}</h1>
                <p className="text-muted-foreground">
                  {epic.value_streams?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Epic
                </Button>
                <EpicActions epic={epic} onEdit={() => setIsEditOpen(true)} onUpdate={loadEpicDetails} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">{progressPercentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Features</p>
                      <p className="text-2xl font-bold">{features.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Business Value</p>
                      <p className="text-2xl font-bold">{epic.business_value || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stakeholders</p>
                      <p className="text-2xl font-bold">{stakeholders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="progress">Progress & Analytics</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="validation">AI Validator</TabsTrigger>
              <TabsTrigger value="closure">Closure & Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {epic.description}
                  </p>
                </CardContent>
              </Card>

              {epic.business_justification && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Justification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {epic.business_justification}
                    </p>
                  </CardContent>
                </Card>
              )}

              {epic.strategic_goals && epic.strategic_goals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {epic.strategic_goals.map((goal: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {epic.acceptance_criteria && epic.acceptance_criteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Acceptance Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {epic.acceptance_criteria.map((criterion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {epic.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Start: {new Date(epic.start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {epic.end_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">End: {new Date(epic.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {epic.effort_estimate && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Effort: {epic.effort_estimate} story points</span>
                      </div>
                    )}
                    {epic.roi_score && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Expected ROI: {epic.roi_score}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Stakeholders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stakeholders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No stakeholders assigned</p>
                    ) : (
                      <ul className="space-y-2">
                        {stakeholders.map((stakeholder) => (
                          <li key={stakeholder.id} className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {stakeholder.profiles?.full_name || stakeholder.profiles?.email}
                              </p>
                              <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features">
              <FeatureBreakdownPanel 
                epicId={id!} 
                features={features}
                onFeaturesChange={loadEpicDetails}
              />
            </TabsContent>

            <TabsContent value="dependencies">
              <DependencyGraph 
                currentEpicId={id!} 
                projectId={epic.value_streams?.project_id}
              />
            </TabsContent>

            <TabsContent value="progress">
              <div className="space-y-6">
                <EpicHealthScore 
                  epicId={id!}
                  currentHealth={epic.health_score}
                  lastCheck={epic.last_health_check}
                  onHealthUpdate={loadEpicDetails}
                />
                
                <EpicBurndownChart 
                  epicId={id!}
                  startDate={epic.start_date}
                  endDate={epic.end_date}
                />
                
                <EpicVelocityMetrics epicId={id!} />
              </div>
            </TabsContent>

            <TabsContent value="milestones">
              <EpicMilestones 
                epicId={id!}
                onMilestoneUpdate={loadEpicDetails}
              />
            </TabsContent>

            <TabsContent value="validation">
              <EpicImplementationValidator epicId={id!} />
            </TabsContent>

            <TabsContent value="closure">
              <div className="space-y-6">
                <EpicClosureWorkflow
                  epicId={id!}
                  onClosureUpdate={loadEpicDetails}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EpicImpactTracking epicId={id!} />
                  <EpicROIDashboard epicId={id!} />
                </div>

                <EpicLessonsLearned 
                  epicId={id!}
                  projectId={epic.value_streams?.project_id}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditEpicDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        epic={epic}
        valueStreams={valueStreams}
        onSuccess={() => {
          loadEpicDetails();
          toast({ title: "Success", description: "Epic updated successfully" });
        }}
      />
    </>
  );
}
