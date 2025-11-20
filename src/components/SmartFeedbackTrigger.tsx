import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SatisfactionSurvey } from "@/components/SatisfactionSurvey";
import { useToast } from "@/hooks/use-toast";

export const SmartFeedbackTrigger = () => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyContext, setSurveyContext] = useState<string>("general");
  const { toast } = useToast();

  useEffect(() => {
    const checkFeedbackTriggers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        // Check if user has already given feedback recently
        const { data: recentFeedback } = await supabase
          .from('survey_responses')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentFeedback) return; // Don't ask again if feedback given in last 7 days

        // Check user activity to determine best time for feedback
        const { data: activityLogs } = await supabase
          .from('user_activity_logs')
          .select('action, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!activityLogs || activityLogs.length === 0) return;

        // Trigger conditions
        const actionCounts = activityLogs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // After completing a sprint planning session
        if (actionCounts['sprint_planning_completed'] >= 1) {
          setSurveyContext("sprint_planning");
          setTimeout(() => setShowSurvey(true), 2000);
          return;
        }

        // After using integrations multiple times
        if ((actionCounts['integration_used'] || 0) >= 3) {
          setSurveyContext("integrations");
          setTimeout(() => setShowSurvey(true), 3000);
          return;
        }

        // After creating multiple projects
        if ((actionCounts['project_created'] || 0) >= 2) {
          setSurveyContext("project_management");
          setTimeout(() => setShowSurvey(true), 2000);
          return;
        }

        // After 10+ total actions (engaged user)
        if (activityLogs.length >= 10) {
          const firstActionDate = new Date(activityLogs[activityLogs.length - 1].created_at);
          const daysSinceFirstAction = (Date.now() - firstActionDate.getTime()) / (1000 * 60 * 60 * 24);
          
          // Ask after 3 days of usage
          if (daysSinceFirstAction >= 3) {
            setSurveyContext("general");
            setTimeout(() => setShowSurvey(true), 5000);
          }
        }
      } catch (error) {
        console.error('Error checking feedback triggers:', error);
      }
    };

    checkFeedbackTriggers();
  }, []);

  const handleSurveyClose = () => {
    setShowSurvey(false);
    toast({
      title: "Thank you for your feedback!",
      description: "Your input helps us improve the platform.",
    });
  };

  if (!showSurvey) return null;

  return (
    <SatisfactionSurvey
      isOpen={showSurvey}
      onClose={handleSurveyClose}
      surveyType={surveyContext}
      title={`How is your ${surveyContext.replace('_', ' ')} experience?`}
      description="Your feedback helps us improve the platform"
    />
  );
};
