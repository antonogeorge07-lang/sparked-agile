import { useEffect } from 'react';
import { usePageTracking } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { analytics } from '@/lib/analytics';
import { requestIdleCallback, cancelIdleCallback } from '@/lib/utils';

/**
 * Analytics Provider Component
 * Handles automatic page view tracking and user identification
 */
export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  // Enable automatic page view tracking (DB-backed)
  usePageTracking();

  // Track authenticated user (deferred to idle time)
  useEffect(() => {
    // Defer analytics to ensure the UI renders first
    const handle = requestIdleCallback(() => {
      const setUserAnalytics = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          analytics.setUserId(user.id);
          analytics.setUserProperties({
            email: user.email,
            created_at: user.created_at,
          });
        }
      };

      setUserAnalytics();
    });

    return () => cancelIdleCallback(handle);
  }, []);

  return <>{children}</>;
};
