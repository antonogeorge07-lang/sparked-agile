import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from '@/integrations/supabase/client';

let fpPromise: Promise<any> | null = null;

// Generate a unique device fingerprint
export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    
    const fp = await fpPromise;
    const result = await fp.get();
    
    // Combine visitorId with additional entropy
    const fingerprint = result.visitorId;
    
    // Hash the fingerprint with SHA-256 for privacy
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Failed to generate fingerprint:', error);
    // Fallback to a random ID stored in localStorage
    let fallbackId = localStorage.getItem('fallback_device_id');
    if (!fallbackId) {
      fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('fallback_device_id', fallbackId);
    }
    return fallbackId;
  }
};

// Track or update visitor in database
export const trackVisitor = async (fingerprint: string): Promise<any> => {
  try {
    // Check if visitor exists
    const { data: existing, error: fetchError } = await supabase
      .from('visitor_tracking')
      .select('*')
      .eq('device_fingerprint', fingerprint)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching visitor:', fetchError);
      return null;
    }

    if (existing) {
      // Update existing visitor
      const { data, error } = await supabase
        .from('visitor_tracking')
        .update({
          last_visit: new Date().toISOString(),
          visit_count: (existing.visit_count || 0) + 1,
        })
        .eq('device_fingerprint', fingerprint)
        .select()
        .single();

      if (error) {
        console.error('Error updating visitor:', error);
        return existing;
      }
      return data;
    } else {
      // Create new visitor
      const { data, error } = await supabase
        .from('visitor_tracking')
        .insert({
          device_fingerprint: fingerprint,
          user_agent: navigator.userAgent,
          visit_count: 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating visitor:', error);
        return null;
      }
      return data;
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return null;
  }
};

// Update visitor preferences
export const updateVisitorPreferences = async (
  fingerprint: string,
  updates: {
    has_seen_onboarding?: boolean;
    has_dismissed_signup_reminder?: boolean;
    total_time_on_site?: number;
    pages_visited?: number;
  }
) => {
  try {
    const { error } = await supabase
      .from('visitor_tracking')
      .update(updates)
      .eq('device_fingerprint', fingerprint);

    if (error) {
      console.error('Error updating visitor preferences:', error);
    }
  } catch (error) {
    console.error('Error updating visitor preferences:', error);
  }
};
