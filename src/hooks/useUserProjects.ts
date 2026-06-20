import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  workspace_id: string | null;
  user_id: string | null;
}

interface Options {
  /** Restrict to a workspace. If omitted, returns every project RLS allows. */
  workspaceId?: string | null;
  /** Auto-select the first project's id once the list loads. Defaults to false. */
  autoSelectFirst?: boolean;
}

interface Result {
  projects: UserProject[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  refresh: () => Promise<void>;
}

/**
 * Generic project list hook used by pages that show a project selector.
 *
 * Replaces the duplicated `from('projects').select('*').order('created_at')`
 * block in ValueStreams, ProgramIncrement, FlowMetrics, Retrospective, etc.
 *
 * RLS does the security work; this hook just centralises the query shape and
 * the "auto-select first project" UX that every page reimplemented.
 */
export function useUserProjects({ workspaceId, autoSelectFirst = false }: Options = {}): Result {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always confirm session before querying (Data Resilience standard).
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProjects([]);
        return;
      }

      let query = supabase
        .from("projects")
        .select("id, name, description, created_at, workspace_id, user_id")
        .order("created_at", { ascending: false });

      if (workspaceId) query = query.eq("workspace_id", workspaceId);

      const { data, error: qError } = await query;
      if (qError) throw qError;

      const rows = (data ?? []) as UserProject[];
      setProjects(rows);

      if (autoSelectFirst) {
        setSelectedProjectId((prev) => prev ?? rows[0]?.id ?? null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, autoSelectFirst]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    projects,
    loading,
    error,
    selectedProjectId,
    setSelectedProjectId,
    refresh: load,
  };
}
