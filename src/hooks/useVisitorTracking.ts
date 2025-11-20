import { useState, useEffect } from 'react';
import { getDeviceFingerprint, trackVisitor, updateVisitorPreferences } from '@/utils/deviceTracking';

interface VisitorData {
  id: string;
  device_fingerprint: string;
  first_visit: string;
  last_visit: string;
  visit_count: number;
  has_seen_onboarding: boolean;
  has_dismissed_signup_reminder: boolean;
  total_time_on_site: number;
  pages_visited: number;
}

export const useVisitorTracking = () => {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const initVisitorTracking = async () => {
      try {
        // Get device fingerprint
        const fp = await getDeviceFingerprint();
        setFingerprint(fp);
        
        // Track visitor in database
        const data = await trackVisitor(fp);
        setVisitorData(data);
      } catch (error) {
        console.error('Failed to initialize visitor tracking:', error);
        // Set default data so components don't break
        setVisitorData({
          id: 'fallback',
          device_fingerprint: 'fallback',
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString(),
          visit_count: 1,
          has_seen_onboarding: false,
          has_dismissed_signup_reminder: false,
          total_time_on_site: 0,
          pages_visited: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initVisitorTracking();
  }, []);

  // Track time on site
  useEffect(() => {
    if (!fingerprint || !visitorData) return;

    const interval = setInterval(() => {
      try {
        const timeOnSite = Math.floor((Date.now() - startTime) / 1000);
        const totalTime = (visitorData.total_time_on_site || 0) + timeOnSite;
        
        updateVisitorPreferences(fingerprint, {
          total_time_on_site: totalTime,
        });
      } catch (error) {
        console.error('Failed to update time on site:', error);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [fingerprint, visitorData, startTime]);

  const updatePreferences = async (updates: Partial<VisitorData>) => {
    if (!fingerprint) return;
    
    try {
      await updateVisitorPreferences(fingerprint, updates);
      setVisitorData(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update visitor preferences:', error);
    }
  };

  const incrementPagesVisited = async () => {
    if (!fingerprint || !visitorData) return;
    
    try {
      const newCount = (visitorData.pages_visited || 0) + 1;
      await updateVisitorPreferences(fingerprint, {
        pages_visited: newCount,
      });
      setVisitorData(prev => prev ? { ...prev, pages_visited: newCount } : null);
    } catch (error) {
      console.error('Failed to increment pages visited:', error);
    }
  };

  return {
    visitorData,
    fingerprint,
    isLoading,
    isReturningVisitor: visitorData ? visitorData.visit_count > 1 : false,
    shouldShowOnboarding: visitorData ? !visitorData.has_seen_onboarding : true,
    shouldShowSignupReminder: visitorData 
      ? !visitorData.has_dismissed_signup_reminder && visitorData.visit_count <= 3
      : true,
    updatePreferences,
    incrementPagesVisited,
  };
};
