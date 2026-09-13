type SupabaseLike = {
  from: (table: string) => any;
};

export interface CommandProjectContext {
  pmiProjectId: string;
  canonicalProjectId: string;
  name: string | null;
}

export async function resolveCommandProject(
  supabase: SupabaseLike,
  pmiProjectId: string,
): Promise<CommandProjectContext> {
  const { data: pmiProject, error: pmiError } = await supabase
    .from("pmi_projects")
    .select("id, name, canonical_project_id")
    .eq("id", pmiProjectId)
    .maybeSingle();

  if (pmiError) {
    throw new Error(`PMI project lookup failed: ${pmiError.message}`);
  }

  if (!pmiProject) {
    throw new Error("PMI project not found or access denied");
  }

  if (!pmiProject.canonical_project_id) {
    throw new Error("Project linkage is incomplete");
  }

  const { data: canonicalProject, error: canonicalError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", pmiProject.canonical_project_id)
    .maybeSingle();

  if (canonicalError) {
    throw new Error(
      `Canonical project lookup failed: ${canonicalError.message}`,
    );
  }

  if (!canonicalProject) {
    throw new Error("Canonical project not found or access denied");
  }

  return {
    pmiProjectId: pmiProject.id,
    canonicalProjectId: canonicalProject.id,
    name: canonicalProject.name ?? pmiProject.name ?? null,
  };
}
