import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectInsights {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  riskFactors: string[];
  completionEta: string;
  sprintsRemaining: number;
  confidence: 'low' | 'medium' | 'high';
  recommendations: string[];
  healthStatus: 'healthy' | 'at-risk' | 'critical';
  velocityTrend: 'improving' | 'stable' | 'declining';
  summary: string;
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  avgVelocity: number;
  avgAccuracy: number;
  activeRisks: number;
  stageDistribution: Record<string, number>;
}

export interface InsightsResponse {
  insights: ProjectInsights;
  metrics: ProjectMetrics;
  generatedAt: string;
}

interface UseProjectInsightsReturn {
  insights: InsightsResponse | null;
  isLoading: boolean;
  error: string | null;
  generateInsights: (projectId: string) => Promise<void>;
  lastGeneratedAt: string | null;
}

export const useProjectInsights = (): UseProjectInsightsReturn => {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const generateInsights = useCallback(async (projectId: string) => {
    if (!projectId) {
      setError('No project selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-project-insights', {
        body: { 
          projectId,
          includeVelocity: true,
          includeRisks: true
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate insights');
      }

      if (data.error) {
        // Handle rate limiting
        if (data.retryAfter) {
          toast.error(`Rate limited. Try again in ${data.retryAfter} seconds.`);
        }
        throw new Error(data.error);
      }

      setInsights(data as InsightsResponse);
      setLastGeneratedAt(data.generatedAt);
      toast.success('AI insights generated');
    } catch (err: any) {
      console.error('Error generating insights:', err);
      const errorMessage = err.message || 'Failed to generate insights';
      setError(errorMessage);
      
      // Don't show toast for rate limit errors (already shown above)
      if (!err.message?.includes('Rate limit')) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    insights,
    isLoading,
    error,
    generateInsights,
    lastGeneratedAt
  };
};
