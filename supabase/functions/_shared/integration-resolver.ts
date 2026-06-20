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

export interface IntegrationResolveError {
  error: 'NOT_CONFIGURED' | 'TOKEN_MISSING' | 'TOKEN_INVALID';
  reconnect_required: boolean;
  integration_type: string;
  message: string;
}

/**
 * Strict resolver: verifies that a user token also exists & is valid.
 * Returns a structured error object the UI can render as a "reconnect" prompt
 * instead of generic failure. Pass `userId` to enable token verification.
 */
export async function resolveIntegrationConfigStrict(
  supabaseClient: any,
  integrationType: string,
  opts: { projectId?: string; workspaceId?: string; userId?: string }
): Promise<IntegrationConfig | IntegrationResolveError> {
  const projectId = opts.projectId || opts.workspaceId;
  if (!projectId) {
    return {
      error: 'NOT_CONFIGURED',
      reconnect_required: true,
      integration_type: integrationType,
      message: `No project context provided for ${integrationType}.`,
    };
  }

  const { data: integration } = await supabaseClient
    .from('integrations')
    .select('id, is_active, config, project_id')
    .eq('project_id', projectId)
    .eq('integration_type', integrationType)
    .eq('is_active', true)
    .maybeSingle();

  if (!integration) {
    return {
      error: 'NOT_CONFIGURED',
      reconnect_required: true,
      integration_type: integrationType,
      message: `${integrationType} is not connected for this project. Please connect it from the Integrations page.`,
    };
  }

  // Verify a valid user token exists when userId is provided
  if (opts.userId && (integrationType === 'jira' || integrationType === 'github')) {
    const tokenTable =
      integrationType === 'jira' ? 'user_jira_tokens' : 'user_github_tokens';
    const { data: token } = await supabaseClient
      .from(tokenTable)
      .select('user_id, is_valid')
      .eq('user_id', opts.userId)
      .maybeSingle();

    if (!token) {
      return {
        error: 'TOKEN_MISSING',
        reconnect_required: true,
        integration_type: integrationType,
        message: `Your ${integrationType} authentication has expired or was never completed. Please reconnect from the Integrations page.`,
      };
    }
    if (!token.is_valid) {
      return {
        error: 'TOKEN_INVALID',
        reconnect_required: true,
        integration_type: integrationType,
        message: `Your ${integrationType} token is no longer valid. Please reconnect from the Integrations page.`,
      };
    }
  }

  return {
    integration_id: integration.id,
    is_active: integration.is_active,
    config: (integration.config as Record<string, any>) || {},
    project_id: integration.project_id,
  };
}

export function isResolveError(
  r: IntegrationConfig | IntegrationResolveError | null
): r is IntegrationResolveError {
  return !!r && (r as IntegrationResolveError).error !== undefined;
}

export async function resolveIntegrationConfig(
  supabaseClient: any,
  integrationType: string,
  opts: { projectId?: string; workspaceId?: string }
): Promise<IntegrationConfig | null> {
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
    const { error } = await supabaseClient
      .from('integrations')
      .update({ config: mergedConfig, is_active: true, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('integrations')
      .insert({
        project_id: projectId,
        integration_type: integrationType,
        name: name || integrationType.charAt(0).toUpperCase() + integrationType.slice(1),
        is_active: true,
        config: configUpdate,
      });
    if (error) throw error;
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
