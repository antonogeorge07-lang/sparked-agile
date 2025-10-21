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
        .select("id, name, integration_type, config, is_active")
        .eq("project_id", projectId)
        .eq("is_active", true);

      if (error) throw error;

      const integrations: IntegrationConfig = {};
      
      data?.forEach((integration) => {
        if (integration.integration_type === "jira") {
          integrations.jira = integration.config as any;
        } else if (integration.integration_type === "github") {
          integrations.github = integration.config as any;
        } else if (integration.integration_type === "outlook") {
          integrations.outlook = integration.config as any;
        }
      });

      return {
        hasJira: !!integrations.jira,
        hasGithub: !!integrations.github,
        hasOutlook: !!integrations.outlook,
        config: integrations,
      };
    },
    enabled: !!projectId,
  });
};
