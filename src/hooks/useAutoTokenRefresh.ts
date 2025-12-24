import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TokenStatus {
  type: string;
  expiresAt: Date | null;
  isValid: boolean;
}

// Refresh tokens 30 minutes before they expire
const REFRESH_BUFFER_MS = 30 * 60 * 1000;
// Check token status every 5 minutes
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export const useAutoTokenRefresh = () => {
  const refreshTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async (integrationType: string) => {
    try {
      console.log(`[AutoRefresh] Refreshing ${integrationType} token...`);
      
      const { error } = await supabase.functions.invoke('refresh-integration-token', {
        body: { integrationType }
      });

      if (error) {
        console.error(`[AutoRefresh] Failed to refresh ${integrationType}:`, error);
        toast.error(`${integrationType} connection expired. Please reconnect.`, {
          action: {
            label: 'Reconnect',
            onClick: () => window.location.href = '/integrations'
          }
        });
        return false;
      }

      console.log(`[AutoRefresh] Successfully refreshed ${integrationType}`);
      return true;
    } catch (error) {
      console.error(`[AutoRefresh] Error refreshing ${integrationType}:`, error);
      return false;
    }
  }, []);

  const scheduleRefresh = useCallback((type: string, expiresAt: Date) => {
    // Clear any existing timeout for this type
    const existingTimeout = refreshTimeouts.current.get(type);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const now = Date.now();
    const expiryTime = expiresAt.getTime();
    const refreshTime = expiryTime - REFRESH_BUFFER_MS;

    if (refreshTime <= now) {
      // Token is already expired or will expire within buffer, refresh now
      console.log(`[AutoRefresh] ${type} needs immediate refresh`);
      refreshToken(type);
    } else {
      // Schedule refresh for later
      const delay = refreshTime - now;
      console.log(`[AutoRefresh] Scheduling ${type} refresh in ${Math.round(delay / 60000)} minutes`);
      
      const timeout = setTimeout(() => {
        refreshToken(type);
      }, delay);
      
      refreshTimeouts.current.set(type, timeout);
    }
  }, [refreshToken]);

  const checkTokenStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check Microsoft tokens
      const { data: msToken } = await supabase
        .from('user_microsoft_tokens')
        .select('expires_at, is_valid')
        .eq('user_id', user.id)
        .maybeSingle();

      if (msToken?.expires_at && msToken.is_valid) {
        scheduleRefresh('microsoft', new Date(msToken.expires_at));
      }

      // Add checks for other token types as needed
    } catch (error) {
      console.error('[AutoRefresh] Error checking token status:', error);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    // Initial check
    checkTokenStatus();

    // Set up periodic checks
    checkIntervalRef.current = setInterval(checkTokenStatus, CHECK_INTERVAL_MS);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      refreshTimeouts.current.forEach(timeout => clearTimeout(timeout));
      refreshTimeouts.current.clear();
    };
  }, [checkTokenStatus]);

  return {
    refreshToken,
    checkTokenStatus
  };
};
