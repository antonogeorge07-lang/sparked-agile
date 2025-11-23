import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  workspace_id: string;
  user_id: string | null;
}

export const useWorkspaceProjects = (workspaceId: string | undefined) => {
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceId) {
      loadProjects();
    }
  }, [workspaceId]);

  const loadProjects = async () => {
    if (!workspaceId) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      console.error('Error loading workspace projects:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    refresh: loadProjects
  };
};
