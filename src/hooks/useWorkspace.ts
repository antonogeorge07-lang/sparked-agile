import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  settings: any;
}

export const useWorkspace = () => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // First try workspace owned by user
      const { data: ownedWorkspace, error: ownedError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (ownedError) throw ownedError;

      if (ownedWorkspace) {
        setWorkspace(ownedWorkspace);
      } else {
        // Fall back to workspaces the user is a member of
        const { data: membership, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (memberError) throw memberError;

        if (membership) {
          const { data: memberWorkspace, error: wsError } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', membership.workspace_id)
            .single();

          if (wsError) throw wsError;
          setWorkspace(memberWorkspace);
        }
      }
    } catch (error: any) {
      console.error('Error loading workspace:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    if (!workspace) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', workspace.id)
        .select()
        .single();

      if (error) throw error;

      setWorkspace(data);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    workspace,
    loading,
    error,
    updateWorkspace,
    refresh: loadWorkspace
  };
};
