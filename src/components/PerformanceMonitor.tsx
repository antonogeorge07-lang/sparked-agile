import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

/**
 * PerformanceMonitor Component
 * Tracks Core Web Vitals and reports to analytics
 */
export const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Track Largest Contentful Paint (LCP) - report once
    try {
      let lcpReported = false;
      const lcpObserver = new PerformanceObserver((list) => {
        if (lcpReported) return;
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry?.renderTime || lastEntry?.loadTime) {
          lcpReported = true;
          const lcp = lastEntry.renderTime || lastEntry.loadTime;
          
          analytics.event({
            action: 'web_vitals',
            category: 'performance',
            label: 'LCP',
            value: Math.round(lcp),
          });
          lcpObserver.disconnect();
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP tracking not supported');
    }

    // Track First Input Delay (FID) - report once
    try {
      let fidReported = false;
      const fidObserver = new PerformanceObserver((list) => {
        if (fidReported) return;
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (!fidReported) {
            fidReported = true;
            const fid = entry.processingStart - entry.startTime;
            
            analytics.event({
              action: 'web_vitals',
              category: 'performance',
              label: 'FID',
              value: Math.round(fid),
            });
            fidObserver.disconnect();
          }
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID tracking not supported');
    }

    // Track Cumulative Layout Shift (CLS) - report once on unload
    try {
      let clsValue = 0;
      let clsReported = false;

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Report CLS when page is hidden or unloaded (only once)
      const reportCLS = () => {
        if (!clsReported && clsValue > 0) {
          clsReported = true;
          analytics.event({
            action: 'web_vitals',
            category: 'performance',
            label: 'CLS',
            value: Math.round(clsValue * 1000) / 1000,
          });
          clsObserver.disconnect();
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportCLS();
        }
      }, { once: true });

      window.addEventListener('beforeunload', reportCLS, { once: true });
    } catch (e) {
      console.warn('CLS tracking not supported');
    }

    // Track Time to First Byte (TTFB)
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        
        analytics.event({
          action: 'web_vitals',
          category: 'performance',
          label: 'TTFB',
          value: Math.round(ttfb),
        });
      }
    } catch (e) {
      console.warn('TTFB tracking not supported');
    }
  }, []);

  return null; // This component doesn't render anything
};
