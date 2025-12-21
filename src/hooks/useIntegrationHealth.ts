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

      // Check all integrations in parallel
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

  // Validate a specific integration
  const validateIntegration = useCallback(async (type: 'github' | 'jira' | 'microsoft') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setHealth(prev => ({
      ...prev,
      [type]: { ...prev[type], isChecking: true },
    }));

    try {
      if (type === 'github') {
        const { data: token } = await supabase
          .from('user_github_tokens')
          .select('github_token')
          .eq('user_id', user.id)
          .single();

        if (token) {
          const response = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${token.github_token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });

          const isValid = response.ok;
          const errorMsg = isValid ? null : `Token expired or invalid (${response.status})`;

          await supabase
            .from('user_github_tokens')
            .update({
              is_valid: isValid,
              last_validated_at: new Date().toISOString(),
              validation_error: errorMsg,
            })
            .eq('user_id', user.id);
        }
      } else if (type === 'jira') {
        const { data: token } = await supabase
          .from('user_jira_tokens')
          .select('jira_token, jira_email, jira_site_url')
          .eq('user_id', user.id)
          .single();

        if (token) {
          const credentials = btoa(`${token.jira_email}:${token.jira_token}`);
          const response = await fetch(`${token.jira_site_url}/rest/api/3/myself`, {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Accept': 'application/json',
            },
          });

          const isValid = response.ok;
          const errorMsg = isValid ? null : `Token expired or invalid (${response.status})`;

          await supabase
            .from('user_jira_tokens')
            .update({
              is_valid: isValid,
              last_validated_at: new Date().toISOString(),
              validation_error: errorMsg,
            })
            .eq('user_id', user.id);
        }
      } else if (type === 'microsoft') {
        const { data: token } = await supabase
          .from('user_microsoft_tokens')
          .select('access_token, expires_at')
          .eq('user_id', user.id)
          .single();

        if (token) {
          // Check if token is expired
          const isExpired = token.expires_at && new Date(token.expires_at) < new Date();
          
          if (isExpired) {
            await supabase
              .from('user_microsoft_tokens')
              .update({
                is_valid: false,
                last_validated_at: new Date().toISOString(),
                validation_error: 'Token expired - please reconnect',
              })
              .eq('user_id', user.id);
          } else {
            // Validate with Microsoft Graph API
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: {
                'Authorization': `Bearer ${token.access_token}`,
              },
            });

            const isValid = response.ok;
            const errorMsg = isValid ? null : `Token invalid (${response.status})`;

            await supabase
              .from('user_microsoft_tokens')
              .update({
                is_valid: isValid,
                last_validated_at: new Date().toISOString(),
                validation_error: errorMsg,
              })
              .eq('user_id', user.id);
          }
        }
      }

      // Refresh health status
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
