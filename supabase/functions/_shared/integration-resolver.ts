/**
 * Unified Integration Resolver
 * Resolves integration config from the `integrations` table.
 * Accepts either projectId or workspaceId (backward compat).
 */

interface IntegrationConfig {
  integration_id: string | null;
  is_active: boolean;
  config: Record<string, any>;
  project_id: string;
}

/**
 * Resolves integration config from the integrations table.
 * Falls back to project_workspaces lookup when only workspaceId is provided.
 */
export async function resolveIntegrationConfig(
  supabaseClient: any,
  integrationType: string,
  opts: { projectId?: string; workspaceId?: string }
): Promise<IntegrationConfig | null> {
  let projectId = opts.projectId;

  // If only workspaceId provided, resolve project_id from project_workspaces
  if (!projectId && opts.workspaceId) {
    const { data } = await supabaseClient
      .from('project_workspaces')
      .select('project_id')
      .eq('id', opts.workspaceId)
      .maybeSingle();
    projectId = data?.project_id;
  }

  if (!projectId) return null;

  // Query integrations table (single source of truth)
  const { data: integration } = await supabaseClient
    .from('integrations')
    .select('id, is_active, config, project_id')
    .eq('project_id', projectId)
    .eq('integration_type', integrationType)
    .eq('is_active', true)
    .maybeSingle();

  if (!integration) return null;

  return {
    integration_id: integration.id,
    is_active: integration.is_active,
    config: (integration.config as Record<string, any>) || {},
    project_id: integration.project_id,
  };
}

/**
 * Updates integration config in the integrations table.
 * Creates the record if it doesn't exist.
 */
export async function upsertIntegrationConfig(
  supabaseClient: any,
  projectId: string,
  integrationType: string,
  configUpdate: Record<string, any>,
  name?: string
): Promise<void> {
  // Check if integration exists
  const { data: existing } = await supabaseClient
    .from('integrations')
    .select('id, config')
    .eq('project_id', projectId)
    .eq('integration_type', integrationType)
    .maybeSingle();

  if (existing) {
    // Merge config
    const mergedConfig = { ...(existing.config || {}), ...configUpdate };
    await supabaseClient
      .from('integrations')
      .update({ config: mergedConfig, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    // Create new integration record
    await supabaseClient
      .from('integrations')
      .insert({
        project_id: projectId,
        integration_type: integrationType,
        name: name || integrationType.charAt(0).toUpperCase() + integrationType.slice(1),
        is_active: true,
        config: configUpdate,
      });
  }
}

/**
 * Resolves project_id from workspace_id
 */
export async function resolveProjectId(
  supabaseClient: any,
  workspaceId: string
): Promise<string | null> {
  const { data } = await supabaseClient
    .from('project_workspaces')
    .select('project_id')
    .eq('id', workspaceId)
    .maybeSingle();
  return data?.project_id || null;
}
