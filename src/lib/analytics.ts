// Unified analytics utility - DB-backed via user_activity_logs table
// Replaces the previous dead GA implementation with a working system

import { supabase } from '@/integrations/supabase/client';

class Analytics {
  private userId: string | null = null;
  private userProperties: Record<string, any> = {};

  setUserId(userId: string) {
    this.userId = userId;
  }

  setUserProperties(properties: Record<string, any>) {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  private async getUser() {
    if (this.userId) return this.userId;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  private async log(action: string, page?: string, metadata?: Record<string, any>) {
    try {
      const userId = await this.getUser();
      if (!userId) return; // Only track authenticated users

      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        action,
        page: page ?? window.location.pathname,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Silent fail - analytics should never break the app
      console.debug('Analytics log failed:', error);
    }
  }

  // Page views
  pageView(path?: string, title?: string) {
    const pagePath = path ?? window.location.pathname;
    this.log('page_view', pagePath, { page_title: title ?? document.title });
  }

  // Generic event
  event({ action, category, label, value }: {
    action: string;
    category: string;
    label?: string;
    value?: number;
  }) {
    this.log(action, undefined, { category, label, value });
  }

  // Common trackers
  trackButtonClick(buttonName: string, location: string) {
    this.log('button_click', location, { button: buttonName });
  }

  trackSignup(method: string) {
    this.log('sign_up', '/auth', { method });
  }

  trackLogin(method: string) {
    this.log('login', '/auth', { method });
  }

  trackFeatureUse(featureName: string) {
    this.log('feature_used', undefined, { feature: featureName });
  }

  trackIntegrationConnect(integrationType: string) {
    this.log('integration_connected', '/integrations', { type: integrationType });
  }

  trackSearch(searchTerm: string) {
    this.log('search', undefined, { query: searchTerm });
  }

  trackError(errorMessage: string, errorLocation: string) {
    this.log('error', errorLocation, { error: errorMessage });
  }

  trackCrash(error: Error, componentStack?: string) {
    this.log('app_crash', window.location.pathname, {
      error_name: error.name,
      error_message: error.message,
      component_stack: componentStack?.slice(0, 500),
    });
  }

  trackApiError(endpoint: string, status: number, message: string) {
    this.log('api_error', undefined, { endpoint, status, error: message });
  }
}

// Export singleton instance
export const analytics = new Analytics();
