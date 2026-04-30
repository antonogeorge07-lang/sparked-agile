/**
 * Unified Integration Resolver
 * Reads from the canonical `integrations` table only. The legacy
 * `project_workspaces` table has been removed; callers must pass projectId.
 */

interface IntegrationConfig {
  integration_id: string | null;
  is_active: boolean;
  config: Record<string, any>;
  project_id: string;
}

export async function resolveIntegrationConfig(
  supabaseClient: any,
  integrationType: string,
  opts: { projectId?: string; workspaceId?: string }
): Promise<IntegrationConfig | null> {
  // workspaceId is now treated as projectId (1:1 mapping post-migration)
  const projectId = opts.projectId || opts.workspaceId;
  if (!projectId) return null;

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

export async function upsertIntegrationConfig(
  supabaseClient: any,
  projectId: string,
  integrationType: string,
  configUpdate: Record<string, any>,
  name?: string
): Promise<void> {
  const { data: existing } = await supabaseClient
    .from('integrations')
    .select('id, config')
    .eq('project_id', projectId)
    .eq('integration_type', integrationType)
    .maybeSingle();

  if (existing) {
    const mergedConfig = { ...(existing.config || {}), ...configUpdate };
    await supabaseClient
      .from('integrations')
      .update({ config: mergedConfig, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
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
 * Backward-compat alias. workspaceId is now identical to projectId.
 */
export async function resolveProjectId(
  _supabaseClient: any,
  workspaceId: string
): Promise<string | null> {
  return workspaceId || null;
}
