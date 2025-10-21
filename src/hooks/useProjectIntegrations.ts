import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntegrationConfig {
  jira?: {
    domain: string;
    email: string;
    project_key: string;
  };
  github?: {
    owner: string;
    repo: string;
  };
  outlook?: {
    tenant_id: string;
    calendar_id?: string;
  };
}

export const useProjectIntegrations = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["project-integrations", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from("integrations")
        .select("id, name, integration_type, is_active")
        .eq("project_id", projectId)
        .eq("is_active", true);

      if (error) throw error;

      // Config data is now protected - we only track which integrations are active
      const hasJira = data?.some(i => i.integration_type === "jira") || false;
      const hasGithub = data?.some(i => i.integration_type === "github") || false;
      const hasOutlook = data?.some(i => i.integration_type === "outlook") || false;

      return {
        hasJira,
        hasGithub,
        hasOutlook,
        config: {}, // Config is no longer exposed for security reasons
      };
    },
    enabled: !!projectId,
  });
};
