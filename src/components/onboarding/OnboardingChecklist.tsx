import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  GitBranch,
  Target,
  Link2,
  Users,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: {
    label: string;
    path?: string;
    onClick?: () => void;
  };
  completed: boolean;
}

export const OnboardingChecklist = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsVisible(false);
        return;
      }

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading progress:', error);
        return;
      }

      setProgress(data);

      // Hide checklist if onboarding is completed
      if (data?.onboarding_completed) {
        const hideChecklist = localStorage.getItem('hide_onboarding_checklist');
        setIsVisible(!hideChecklist);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('hide_onboarding_checklist', 'true');
    setIsVisible(false);
    toast({
      title: "Checklist hidden",
      description: "You can always access it from your profile menu",
    });
  };

  const checklistItems: ChecklistItem[] = [
    {
      id: 'create-project',
      title: 'Create Your First Project',
      description: 'Set up a workspace for your team',
      icon: FolderPlus,
      action: {
        label: 'Create Project',
        path: '/project-workspace',
      },
      completed: !!progress?.first_project_id || progress?.completed_steps?.includes('create-project'),
    },
    {
      id: 'create-value-stream',
      title: 'Define a Value Stream',
      description: 'Organize work around business outcomes',
      icon: GitBranch,
      action: {
        label: 'Create Value Stream',
        path: '/value-streams',
      },
      completed: !!progress?.first_value_stream_id || progress?.completed_steps?.includes('create-value-stream'),
    },
    {
      id: 'create-epic',
      title: 'Launch Your First Epic',
      description: 'Plan a strategic initiative',
      icon: Target,
      action: {
        label: 'Create Epic',
        path: '/epic-management',
      },
      completed: !!progress?.first_epic_id || progress?.completed_steps?.includes('create-epic'),
    },
    {
      id: 'connect-integration',
      title: 'Connect Your Tools',
      description: 'Integrate JIRA, GitHub, or Microsoft 365',
      icon: Link2,
      action: {
        label: 'Setup Integrations',
        path: '/integrations',
      },
      completed: progress?.completed_steps?.includes('connect-integration'),
    },
    {
      id: 'invite-team',
      title: 'Invite Team Members',
      description: 'Collaborate with your team',
      icon: Users,
      action: {
        label: 'Manage Team',
        path: '/project-workspace',
      },
      completed: progress?.completed_steps?.includes('invite-team'),
    },
    {
      id: 'run-ceremony',
      title: 'Run Your First Ceremony',
      description: 'Try AI-powered standup or sprint planning',
      icon: Calendar,
      action: {
        label: 'Start Standup',
        path: '/standup',
      },
      completed: progress?.completed_steps?.includes('run-ceremony'),
    },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const isFullyCompleted = completedCount === totalCount;

  if (!isVisible || loading) return null;

  return (
    <Card className="sticky top-20 z-10 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Getting Started Checklist</CardTitle>
              {isFullyCompleted && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">
              {completedCount} of {totalCount} steps completed
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={progressPercentage} className="mt-3" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pb-4">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                item.completed
                  ? "bg-primary/5 border-primary/20"
                  : "bg-background hover:bg-accent/50"
              )}
            >
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      item.completed && "text-muted-foreground line-through"
                    )}>
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {!item.completed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (item.action.path) {
                          navigate(item.action.path);
                        } else if (item.action.onClick) {
                          item.action.onClick();
                        }
                      }}
                    >
                      {item.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isFullyCompleted && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm font-medium text-primary">
                🎉 Congratulations! You've completed all setup tasks.
              </p>
              <Button
                size="sm"
                variant="link"
                className="mt-2"
                onClick={handleDismiss}
              >
                Dismiss Checklist
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
