// Analytics utility for tracking user events and page views
// Supports Google Analytics 4, with easy extensibility for other platforms

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface PageViewEvent {
  page_path: string;
  page_title: string;
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Analytics Service
 * 
 * STATUS: Ready for configuration, currently inactive
 * 
 * This analytics system is fully integrated but not actively sending data.
 * To activate:
 * 1. Choose an analytics provider (Google Analytics, Mixpanel, Amplitude, etc.)
 * 2. Add the provider's SDK to dependencies
 * 3. Configure API keys in Lovable Cloud secrets
 * 4. Update the methods below to send events to your chosen provider
 * 
 * Current integration points:
 * - AnalyticsProvider: Wraps the app and tracks page views
 * - useAnalytics hook: Available throughout the app for event tracking
 * - Landing page: Tracks button clicks and user interactions
 * 
 * Events currently tracked (when provider is configured):
 * - Page views
 * - Button clicks
 * - User signup/login
 * - Feature usage
 * - Integration connections
 * - Search queries
 * - Errors
 */

class Analytics {
  private enabled: boolean = false;
  private measurementId: string = '';

  init(measurementId?: string) {
    if (typeof window === 'undefined') return;
    
    this.measurementId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID || '';
    
    if (!this.measurementId) {
      console.warn('Analytics: No measurement ID provided. Analytics disabled.');
      return;
    }

    // Initialize Google Analytics
    this.loadGoogleAnalytics();
    this.enabled = true;
  }

  private loadGoogleAnalytics() {
    if (typeof window === 'undefined') return;

    // Create script tag for GA4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false, // We'll manually track page views
      anonymize_ip: true, // GDPR compliance
    });

    console.log('Analytics: Google Analytics initialized');
  }

  // Track page views
  pageView(path?: string, title?: string) {
    if (!this.enabled || typeof window === 'undefined') return;

    const pageData: PageViewEvent = {
      page_path: path || window.location.pathname,
      page_title: title || document.title,
    };

    if (window.gtag) {
      window.gtag('event', 'page_view', pageData);
    }

    console.log('Analytics: Page view tracked', pageData);
  }

  // Track custom events
  event({ action, category, label, value }: AnalyticsEvent) {
    if (!this.enabled || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    console.log('Analytics: Event tracked', { action, category, label, value });
  }

  // Common event trackers
  trackButtonClick(buttonName: string, location: string) {
    this.event({
      action: 'button_click',
      category: 'engagement',
      label: `${location}:${buttonName}`,
    });
  }

  trackSignup(method: string) {
    this.event({
      action: 'sign_up',
      category: 'conversion',
      label: method,
    });
  }

  trackLogin(method: string) {
    this.event({
      action: 'login',
      category: 'conversion',
      label: method,
    });
  }

  trackFeatureUse(featureName: string) {
    this.event({
      action: 'feature_used',
      category: 'engagement',
      label: featureName,
    });
  }

  trackIntegrationConnect(integrationType: string) {
    this.event({
      action: 'integration_connected',
      category: 'engagement',
      label: integrationType,
    });
  }

  trackSearch(searchTerm: string) {
    this.event({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
    });
  }

  trackError(errorMessage: string, errorLocation: string) {
    this.event({
      action: 'error',
      category: 'technical',
      label: `${errorLocation}:${errorMessage}`,
    });
  }

  // User properties
  setUserId(userId: string) {
    if (!this.enabled || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        user_id: userId,
      });
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.enabled || typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Initialize on module load (will check for measurement ID)
if (typeof window !== 'undefined') {
  analytics.init();
}
