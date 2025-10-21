import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useActivityTracking = (page: string) => {
  useEffect(() => {
    const trackPageView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        await supabase.from("user_activity_logs").insert({
          user_id: user.id,
          action: "page_view",
          page,
          metadata: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
        });
      } catch (error) {
        console.error("Failed to track activity:", error);
      }
    };

    trackPageView();
  }, [page]);
};

export const trackAction = async (action: string, metadata?: Record<string, any>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("user_activity_logs").insert({
      user_id: user.id,
      action,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Failed to track action:", error);
  }
};

export const trackAIUsage = async (params: {
  model: string;
  tokens_used: number;
  endpoint: string;
  project_id?: string;
  cost_estimate?: number;
  status?: string;
  error_message?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      ...params,
    });
  } catch (error) {
    console.error("Failed to track AI usage:", error);
  }
};
