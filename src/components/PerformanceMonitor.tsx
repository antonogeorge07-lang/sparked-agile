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

    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry?.renderTime || lastEntry?.loadTime) {
          const lcp = lastEntry.renderTime || lastEntry.loadTime;
          
          analytics.event({
            action: 'web_vitals',
            category: 'performance',
            label: 'LCP',
            value: Math.round(lcp),
          });
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP tracking not supported');
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          
          analytics.event({
            action: 'web_vitals',
            category: 'performance',
            label: 'FID',
            value: Math.round(fid),
          });
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID tracking not supported');
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      let clsEntries: any[] = [];

      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Report CLS when page is hidden or unloaded
      const reportCLS = () => {
        if (clsValue > 0) {
          analytics.event({
            action: 'web_vitals',
            category: 'performance',
            label: 'CLS',
            value: Math.round(clsValue * 1000) / 1000,
          });
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportCLS();
        }
      });

      window.addEventListener('beforeunload', reportCLS);
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
