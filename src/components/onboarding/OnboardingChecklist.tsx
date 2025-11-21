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
        <CardContent className="pb-6 pt-2">
          {/* Horizontal Fishbone Timeline */}
          <div className="relative overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              {/* Central spine line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2" />
              
              {/* Timeline items */}
              <div className="relative flex justify-between items-center px-8 py-12">
                {checklistItems.map((item, index) => {
                  const isAbove = index % 2 === 0;
                  const Icon = item.icon;
                  
                  return (
                    <div
                      key={item.id}
                      className="relative flex flex-col items-center"
                      style={{ flex: '1 1 0' }}
                    >
                      {/* Connecting line to spine */}
                      <div
                        className={cn(
                          "absolute left-1/2 w-0.5 -translate-x-1/2 transition-all",
                          isAbove ? "bottom-1/2 top-auto h-16" : "top-1/2 bottom-auto h-16",
                          item.completed 
                            ? "bg-primary" 
                            : "bg-border"
                        )}
                      />
                      
                      {/* Card container */}
                      <div
                        className={cn(
                          "relative w-full max-w-[140px] transition-all",
                          isAbove ? "mb-16" : "mt-16"
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer",
                            item.completed
                              ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                              : "bg-background border-border hover:border-primary/50 hover:shadow-md"
                          )}
                          onClick={() => {
                            if (!item.completed && item.action.path) {
                              navigate(item.action.path);
                            } else if (!item.completed && item.action.onClick) {
                              item.action.onClick();
                            }
                          }}
                        >
                          {/* Icon and status */}
                          <div className="flex items-center justify-between mb-2">
                            <div className={cn(
                              "p-2 rounded-full transition-all",
                              item.completed
                                ? "bg-primary/20"
                                : "bg-muted"
                            )}>
                              <Icon className={cn(
                                "h-4 w-4",
                                item.completed ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            {item.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Content */}
                          <h4 className={cn(
                            "text-xs font-semibold mb-1 leading-tight",
                            item.completed && "text-muted-foreground"
                          )}>
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                            {item.description}
                          </p>
                          
                          {/* Action button */}
                          {!item.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2 h-7 text-[10px] px-2"
                              onClick={(e) => {
                                e.stopPropagation();
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
                        
                        {/* Step number badge */}
                        <div className={cn(
                          "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2",
                          item.completed
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border"
                        )}>
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Completion message */}
          {isFullyCompleted && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg text-center border border-primary/20">
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
