/**
 * Unified integrations barrel.
 *
 * One import path for every layer that needs to know which tools a project
 * has connected, what live data they returned, and whether the user's tokens
 * are still valid.
 *
 *   import { useIntegrations, useIntegrationHealth } from "@/hooks/useIntegrations";
 *
 * The legacy hooks (useProjectIntegrations, useUnifiedIntegrations,
 * useIntegrationData, useIntegrationHealth) remain as thin re-exports to keep
 * existing call sites compiling while we migrate.
 */

export { useIntegrationData as useIntegrations } from "./useIntegrationData";
export { useIntegrationData } from "./useIntegrationData";
export { useProjectIntegrations } from "./useProjectIntegrations";
export { useUnifiedIntegrations } from "./useUnifiedIntegrations";
export { useIntegrationHealth } from "./useIntegrationHealth";
export type { IntegrationConfig } from "./useProjectIntegrations";
export type { IntegrationHealth } from "./useIntegrationHealth";
