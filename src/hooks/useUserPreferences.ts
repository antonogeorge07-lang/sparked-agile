import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  landingPage?: string;
  theme?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  landingPage: '/dashboard',
};

const LANDING_PAGE_OPTIONS = [
  { value: '/dashboard', label: 'Dashboard', description: 'Sprint health and team overview' },
  { value: '/my-projects', label: 'My Projects', description: 'Quick access to your projects' },
  { value: '/project-command-centre', label: 'Command Centre', description: 'Task and project management' },
  { value: '/epic-management', label: 'Epic Management', description: 'Epic planning and tracking' },
  { value: '/standup', label: 'Daily Standup', description: 'Team standup updates' },
  { value: '/home', label: 'Home', description: 'Platform overview and features' },
];

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.preferences) {
        const prefs = typeof data.preferences === 'string' 
          ? JSON.parse(data.preferences) 
          : data.preferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...prefs });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newPreferences = { ...preferences, ...updates };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(newPreferences);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    landingPageOptions: LANDING_PAGE_OPTIONS,
  };
}
