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
}

export const useIntegrationHealth = () => {
  const [health, setHealth] = useState<Record<string, IntegrationHealth>>({
    github: { type: 'github', connected: false, isValid: false, lastValidated: null, error: null, identifier: null, isChecking: true },
    jira: { type: 'jira', connected: false, isValid: false, lastValidated: null, error: null, identifier: null, isChecking: true },
    microsoft: { type: 'microsoft', connected: false, isValid: false, lastValidated: null, error: null, identifier: null, isChecking: true },
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
          .from('user_jira_tokens')
          .select('jira_email, is_valid, last_validated_at, validation_error')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_microsoft_tokens')
          .select('user_email, is_valid, last_validated_at, validation_error, expires_at')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      setHealth({
        github: {
          type: 'github',
          connected: !!githubResult.data,
          isValid: githubResult.data?.is_valid ?? false,
          lastValidated: githubResult.data?.last_validated_at ? new Date(githubResult.data.last_validated_at) : null,
          error: githubResult.data?.validation_error || null,
          identifier: githubResult.data?.github_username || null,
          isChecking: false,
        },
        jira: {
          type: 'jira',
          connected: !!jiraResult.data,
          isValid: jiraResult.data?.is_valid ?? false,
          lastValidated: jiraResult.data?.last_validated_at ? new Date(jiraResult.data.last_validated_at) : null,
          error: jiraResult.data?.validation_error || null,
          identifier: jiraResult.data?.jira_email || null,
          isChecking: false,
        },
        microsoft: {
          type: 'microsoft',
          connected: !!microsoftResult.data,
          isValid: microsoftResult.data?.is_valid ?? false,
          lastValidated: microsoftResult.data?.last_validated_at ? new Date(microsoftResult.data.last_validated_at) : null,
          error: microsoftResult.data?.validation_error || null,
          identifier: microsoftResult.data?.user_email || null,
          isChecking: false,
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
  };
};