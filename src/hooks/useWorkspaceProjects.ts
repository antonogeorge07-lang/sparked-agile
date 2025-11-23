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

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Refresh the list after deletion
      await loadProjects();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting project:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    projects,
    loading,
    error,
    refresh: loadProjects,
    deleteProject
  };
};
