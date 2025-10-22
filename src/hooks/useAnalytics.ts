import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

/**
 * Hook to automatically track page views when route changes
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analytics.pageView(location.pathname, document.title);
  }, [location]);
};

/**
 * Hook to get analytics tracking functions
 */
export const useAnalytics = () => {
  return {
    trackEvent: analytics.event.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackSignup: analytics.trackSignup.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackFeatureUse: analytics.trackFeatureUse.bind(analytics),
    trackIntegrationConnect: analytics.trackIntegrationConnect.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
  };
};
