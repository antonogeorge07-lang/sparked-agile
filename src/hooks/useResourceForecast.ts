import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SprintForecast {
  sprint_number: number;
  predicted_velocity: number;
  capacity_utilisation: number;
  risk_level: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ResourceRecommendation {
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  category: 'staffing' | 'scope' | 'process' | 'risk';
}

export interface ResourceForecast {
  forecastId: string | null;
  confidence: 'low' | 'medium' | 'high';
  analysis: string;
  sprint_forecasts: SprintForecast[];
  recommendations: ResourceRecommendation[];
  backlog_completion_estimate: string;
  bottleneck_risks?: string[];
}

interface UseResourceForecastReturn {
  isForecasting: boolean;
  forecast: ResourceForecast | null;
  generateForecast: (params: {
    projectId: string;
    sprintsAhead?: number;
    forecastType?: string;
  }) => Promise<ResourceForecast | null>;
  loadForecasts: (projectId: string) => Promise<void>;
  savedForecasts: Array<{
    id: string;
    forecast_type: string;
    confidence_level: string;
    ai_analysis: string | null;
    sprints_ahead: number;
    created_at: string;
  }>;
}

export function useResourceForecast(): UseResourceForecastReturn {
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecast, setForecast] = useState<ResourceForecast | null>(null);
  const [savedForecasts, setSavedForecasts] = useState<any[]>([]);

  const generateForecast = useCallback(async (params: {
    projectId: string;
    sprintsAhead?: number;
    forecastType?: string;
  }): Promise<ResourceForecast | null> => {
    setIsForecasting(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-resources', {
        body: params,
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return null;
      }
      setForecast(data as ResourceForecast);
      toast.success('Resource forecast generated');
      return data as ResourceForecast;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate forecast');
      return null;
    } finally {
      setIsForecasting(false);
    }
  }, []);

  const loadForecasts = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('resource_forecasts')
        .select('id, forecast_type, confidence_level, ai_analysis, sprints_ahead, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setSavedForecasts(data || []);
    } catch (err) {
      console.error('Failed to load forecasts:', err);
    }
  }, []);

  return { isForecasting, forecast, generateForecast, loadForecasts, savedForecasts };
}
