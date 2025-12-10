import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Rocket,
  FolderPlus,
  GitBranch,
  Target,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

interface OnboardingProgress {
  user_id: string;
  completed_steps: string[];
  current_step: string;
  onboarding_completed: boolean;
  first_project_id?: string;
  first_value_stream_id?: string;
  first_epic_id?: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
  roleSpecific?: string[];
}

export const OnboardingWizard = ({ isOpen, onClose, userRole = 'member' }: OnboardingWizardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [valueStreamName, setValueStreamName] = useState("");
  const [valueStreamDescription, setValueStreamDescription] = useState("");
  const [epicTitle, setEpicTitle] = useState("");
  const [epicDescription, setEpicDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProgress();
    }
  }, [isOpen]);

  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading progress:', error);
      return;
    }

    if (data) {
      // Cast completed_steps from Json to string[]
      const progressData: OnboardingProgress = {
        ...data,
        completed_steps: Array.isArray(data.completed_steps) ? data.completed_steps as string[] : [],
      };
      setProgress(progressData);
      // Find current step index
      const stepIndex = steps.findIndex(s => s.id === data.current_step);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    }
  };

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating progress:', error);
    } else {
      loadProgress();
    }
  };

  const markStepComplete = async (stepId: string) => {
    const completedSteps = [...(progress?.completed_steps || [])];
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
      await updateProgress({ completed_steps: completedSteps });
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if project already exists from previous attempt
      if (progress?.first_project_id) {
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('id', progress.first_project_id)
          .single();

        if (existingProject) {
          toast({
            title: "Project already exists",
            description: "Moving to next step...",
          });
          return true;
        }
      }

      // Get user's workspace - required for RLS policies
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (workspaceError || !workspace) {
        toast({
          title: "Workspace not found",
          description: "Please ensure you have a workspace created first.",
          variant: "destructive",
        });
        return false;
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: projectDescription || null,
          workspace_id: workspace.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add user as project member
      await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'owner',
        });

      await updateProgress({
        first_project_id: project.id,
      });

      await markStepComplete('create-project');

      toast({
        title: "Project created! 🎉",
        description: `${projectName} is ready to go`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createValueStream = async () => {
    if (!valueStreamName.trim()) {
      toast({
        title: "Value stream name required",
        description: "Please enter a name for your value stream",
        variant: "destructive",
      });
      return false;
    }

    if (!progress?.first_project_id) {
      toast({
        title: "Project required",
        description: "Please create a project first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Check if value stream already exists
      if (progress?.first_value_stream_id) {
        const { data: existing } = await supabase
          .from('value_streams')
          .select('id')
          .eq('id', progress.first_value_stream_id)
          .single();

        if (existing) {
          toast({
            title: "Value stream already exists",
            description: "Moving to next step...",
          });
          return true;
        }
      }

      const { data: valueStream, error } = await supabase
        .from('value_streams')
        .insert({
          project_id: progress.first_project_id,
          name: valueStreamName,
          description: valueStreamDescription || null,
        })
        .select()
        .single();

      if (error) throw error;

      await updateProgress({
        first_value_stream_id: valueStream.id,
      });

      await markStepComplete('create-value-stream');

      toast({
        title: "Value stream created! 🌊",
        description: `${valueStreamName} is set up`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error creating value stream",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createEpic = async () => {
    if (!epicTitle.trim()) {
      toast({
        title: "Epic title required",
        description: "Please enter a title for your epic",
        variant: "destructive",
      });
      return false;
    }

    if (!progress?.first_value_stream_id) {
      toast({
        title: "Value stream required",
        description: "Please create a value stream first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Check if epic already exists
      if (progress?.first_epic_id) {
        const { data: existing } = await supabase
          .from('epics')
          .select('id')
          .eq('id', progress.first_epic_id)
          .single();

        if (existing) {
          toast({
            title: "Epic already exists",
            description: "Moving to completion...",
          });
          return true;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: epic, error } = await supabase
        .from('epics')
        .insert({
          value_stream_id: progress.first_value_stream_id,
          title: epicTitle,
          description: epicDescription || null,
          status: 'backlog',
          priority: 'medium',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await updateProgress({
        first_epic_id: epic.id,
      });

      await markStepComplete('create-epic');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Epic created! 🎯",
        description: `${epicTitle} is ready for features`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error creating epic",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    await updateProgress({
      onboarding_completed: true,
      current_step: 'completed',
    });

    await markStepComplete('onboarding-complete');

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 }
    });

    toast({
      title: "Welcome aboard! 🚀",
      description: "You're all set to start using SAAI",
    });

    onClose();
    
    // Navigate to project command centre
    if (progress?.first_project_id) {
      navigate('/project-command-centre');
    }
  };

  const getRoleGuidance = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: Shield,
          title: "Admin Setup",
          description: "As an admin, you can manage the entire platform, approve users, and configure integrations.",
        };
      case 'member':
        return {
          icon: Users,
          title: "Member Setup",
          description: "You'll be collaborating on projects. Let's set up your first workspace.",
        };
      default:
        return {
          icon: Rocket,
          title: "Getting Started",
          description: "Let's get you up and running in just a few steps!",
        };
    }
  };

  const roleGuidance = getRoleGuidance(userRole);

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: roleGuidance.title,
      description: roleGuidance.description,
      icon: roleGuidance.icon,
      content: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <roleGuidance.icon className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Welcome to SAAI! 🎉</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We'll guide you through setting up your first project, value stream, and epic.
              This will only take about 2 minutes.
            </p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Create Your Project</p>
                    <p className="text-sm text-muted-foreground">Set up your workspace</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Define a Value Stream</p>
                    <p className="text-sm text-muted-foreground">Organize work around business outcomes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">Launch Your First Epic</p>
                    <p className="text-sm text-muted-foreground">Start planning strategic initiatives</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'create-project',
      title: "Create Your First Project",
      description: "Projects are workspaces where your team collaborates on initiatives",
      icon: FolderPlus,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="e.g., Mobile App Redesign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (Optional)</Label>
            <Textarea
              id="project-description"
              placeholder="What is this project about?"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>💡 Tip:</strong> Projects organize all your work. You can create multiple projects for different teams or initiatives.
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'create-value-stream',
      title: "Define Your Value Stream",
      description: "Value streams organize work around customer value delivery",
      icon: GitBranch,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vs-name">Value Stream Name *</Label>
            <Input
              id="vs-name"
              placeholder="e.g., Customer Experience"
              value={valueStreamName}
              onChange={(e) => setValueStreamName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vs-description">Description (Optional)</Label>
            <Textarea
              id="vs-description"
              placeholder="What business outcomes does this stream deliver?"
              value={valueStreamDescription}
              onChange={(e) => setValueStreamDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
            <CardContent className="pt-4">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>💡 Why Value Streams?</strong> They align work with business goals and customer value. Examples: "Digital Sales", "Customer Support", "Product Innovation".
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'create-epic',
      title: "Launch Your First Epic",
      description: "Epics are large initiatives that deliver significant business value",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="epic-title">Epic Title *</Label>
            <Input
              id="epic-title"
              placeholder="e.g., Redesign Mobile Checkout Flow"
              value={epicTitle}
              onChange={(e) => setEpicTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="epic-description">Description (Optional)</Label>
            <Textarea
              id="epic-description"
              placeholder="What will this epic achieve?"
              value={epicDescription}
              onChange={(e) => setEpicDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardContent className="pt-4">
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>💡 Epic Best Practices:</strong> Epics should be achievable in 8-12 weeks and deliver measurable business value. Break them into smaller features later.
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'completion',
      title: "You're All Set! 🎉",
      description: "Your workspace is ready. Let's explore what you can do next",
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div className="text-center py-4">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-muted-foreground">
              You've created your first project, value stream, and epic. Here's what you can do next:
            </p>
          </div>

          <div className="space-y-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/epic-management')}>
              <CardContent className="pt-4 flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Manage Your Epics</p>
                  <p className="text-sm text-muted-foreground">Break down epics into features</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/project-command-centre')}>
              <CardContent className="pt-4 flex items-center gap-3">
                <FolderPlus className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Command Centre</p>
                  <p className="text-sm text-muted-foreground">Visual project management</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/integrations')}>
              <CardContent className="pt-4 flex items-center gap-3">
                <GitBranch className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold">Connect Tools</p>
                  <p className="text-sm text-muted-foreground">Integrate JIRA, GitHub, and more</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  const isStepCompleted = progress?.completed_steps?.includes(currentStep.id);

  const handleNext = async () => {
    let canProceed = true;

    // Execute step-specific actions
    if (currentStep.id === 'create-project') {
      canProceed = await createProject();
    } else if (currentStep.id === 'create-value-stream') {
      canProceed = await createValueStream();
    } else if (currentStep.id === 'create-epic') {
      canProceed = await createEpic();
    } else if (currentStep.id === 'completion') {
      await completeOnboarding();
      return;
    }

    if (canProceed) {
      if (currentStepIndex < steps.length - 1) {
        const nextStep = steps[currentStepIndex + 1];
        await updateProgress({ current_step: nextStep.id });
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      updateProgress({ current_step: prevStep.id });
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    updateProgress({ onboarding_completed: true, current_step: 'skipped' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="gap-2">
              <currentStep.icon className="h-3 w-3" />
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
            {isStepCompleted && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
          <Progress value={progressPercentage} className="mt-4" />
        </DialogHeader>

        <div className="py-6">
          {currentStep.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip Setup
          </Button>

          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                "Processing..."
              ) : currentStep.id === 'completion' ? (
                <>
                  Get Started
                  <Rocket className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  {isStepCompleted ? 'Continue' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
