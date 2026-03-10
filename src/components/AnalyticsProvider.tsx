import { useEffect } from 'react';
import { usePageTracking } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { analytics } from '@/lib/analytics';

/**
 * Analytics Provider Component
 * Handles automatic page view tracking and user identification
 */
export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  // Enable automatic page view tracking (DB-backed)
  usePageTracking();

  // Track authenticated user
  useEffect(() => {
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        analytics.setUserId(session.user.id);
        analytics.setUserProperties({
          email: session.user.email,
          created_at: session.user.created_at,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
};
