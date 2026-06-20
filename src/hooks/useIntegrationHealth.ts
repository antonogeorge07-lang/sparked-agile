import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IntegrationHealth {
  type: 'github' | 'jira' | 'microsoft';
  connected: boolean;
  isValid: boolean;
  lastValidated: Date | null;
  error: string | null;
  identifier: string | null; // username/email
  isChecking: boolean;
  needsReconnect: boolean; // connected but token invalid/expired
}


export const useIntegrationHealth = () => {
  const [health, setHealth] = useState<Record<string, IntegrationHealth>>({
    github: { type: 'github', connected: false, isValid: false, lastValidated: null, error: null, identifier: null, isChecking: true, needsReconnect: false },
    jira: { type: 'jira', connected: false, isValid: false, lastValidated: null, error: null, identifier: null, isChecking: true, needsReconnect: false },
    microsoft: { type: 'microsoft', connected: false, isValid: false, lastValidated: null, error: null, identifier: null, isChecking: true, needsReconnect: false },
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check all integrations in parallel - only fetch non-sensitive metadata
      const [githubResult, jiraResult, microsoftResult] = await Promise.all([
        supabase
          .from('user_github_tokens')
          .select('github_username, is_valid, last_validated_at, validation_error')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_jira_tokens_safe')
          .select('is_valid, last_validated_at, validation_error')
          .maybeSingle(),
        supabase
          .from('user_microsoft_token_status')
          .select('is_valid, last_validated_at, validation_error, expires_at')
          .maybeSingle(),
      ]);


      const ghConnected = !!githubResult.data;
      const ghValid = githubResult.data?.is_valid ?? false;
      const jiraConnected = !!jiraResult.data;
      const jiraValid = jiraResult.data?.is_valid ?? false;
      const msConnected = !!microsoftResult.data;
      const msValid = microsoftResult.data?.is_valid ?? false;

      setHealth({
        github: {
          type: 'github',
          connected: ghConnected,
          isValid: ghValid,
          lastValidated: githubResult.data?.last_validated_at ? new Date(githubResult.data.last_validated_at) : null,
          error: githubResult.data?.validation_error || null,
          identifier: githubResult.data?.github_username || null,
          isChecking: false,
          needsReconnect: ghConnected && !ghValid,
        },
        jira: {
          type: 'jira',
          connected: jiraConnected,
          isValid: jiraValid,
          lastValidated: jiraResult.data?.last_validated_at ? new Date(jiraResult.data.last_validated_at) : null,
          error: jiraResult.data?.validation_error || null,
          identifier: null,
          isChecking: false,
          needsReconnect: jiraConnected && !jiraValid,
        },
        microsoft: {
          type: 'microsoft',
          connected: msConnected,
          isValid: msValid,
          lastValidated: microsoftResult.data?.last_validated_at ? new Date(microsoftResult.data.last_validated_at) : null,
          error: microsoftResult.data?.validation_error || null,
          identifier: null,
          isChecking: false,
          needsReconnect: msConnected && !msValid,
        },
      });

    } catch (error) {
      console.error('Error checking integration health:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate a specific integration - uses edge function to decrypt and validate tokens securely
  const validateIntegration = useCallback(async (type: 'github' | 'jira' | 'microsoft') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setHealth(prev => ({
      ...prev,
      [type]: { ...prev[type], isChecking: true },
    }));

    try {
      // Use edge function to validate tokens securely (tokens never sent to client)
      const { data, error } = await supabase.functions.invoke('validate-integration-token', {
        body: { integrationType: type },
      });

      if (error) {
        console.error(`Error validating ${type}:`, error);
        setHealth(prev => ({
          ...prev,
          [type]: { ...prev[type], isChecking: false, error: 'Validation failed' },
        }));
        return;
      }

      // Refresh health status after validation
      await checkHealth();
    } catch (error) {
      console.error(`Error validating ${type}:`, error);
      setHealth(prev => ({
        ...prev,
        [type]: { ...prev[type], isChecking: false, error: 'Validation failed' },
      }));
    }
  }, [checkHealth]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    isLoading,
    checkHealth,
    validateIntegration,
    allHealthy: Object.values(health).every(h => !h.connected || h.isValid),
    anyNeedsReconnect: Object.values(health).some(h => h.needsReconnect),
    reconnectList: Object.values(health).filter(h => h.needsReconnect),
  };
};
