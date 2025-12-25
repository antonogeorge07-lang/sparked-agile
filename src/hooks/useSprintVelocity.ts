import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VelocityDataPoint {
  sprint_number: number;
  committed_points: number;
  delivered_points: number;
  accuracy_percentage: number;
  sprint_date: string;
}

interface VelocityTrend {
  sprint_number: number;
  velocity: number;
  delivered_points: number;
  trend: 'up' | 'down' | 'stable';
  sprint_date: string;
}

interface UseSprintVelocityReturn {
  commitmentData: VelocityDataPoint[];
  velocityTrends: VelocityTrend[];
  averageVelocity: number;
  averageAccuracy: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSprintVelocity = (projectId: string | null): UseSprintVelocityReturn => {
  const [commitmentData, setCommitmentData] = useState<VelocityDataPoint[]>([]);
  const [velocityTrends, setVelocityTrends] = useState<VelocityTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVelocityData = useCallback(async () => {
    if (!projectId) {
      setCommitmentData([]);
      setVelocityTrends([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch commitment accuracy data
      const { data: commitmentResult, error: commitmentError } = await supabase
        .from('sprint_velocity_history')
        .select('sprint_number, committed_points, delivered_points, created_at')
        .eq('project_id', projectId)
        .order('sprint_number', { ascending: true })
        .limit(12);

      if (commitmentError) throw commitmentError;

      const formattedCommitment: VelocityDataPoint[] = (commitmentResult || []).map(row => ({
        sprint_number: row.sprint_number,
        committed_points: row.committed_points || 0,
        delivered_points: row.delivered_points || 0,
        accuracy_percentage: row.committed_points > 0 
          ? Math.round((row.delivered_points / row.committed_points) * 100) 
          : 0,
        sprint_date: row.created_at
      }));

      setCommitmentData(formattedCommitment);

      // Calculate velocity trends
      const trends: VelocityTrend[] = formattedCommitment.map((row, index) => {
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (index > 0) {
          const prevDelivered = formattedCommitment[index - 1].delivered_points;
          if (row.delivered_points > prevDelivered) trend = 'up';
          else if (row.delivered_points < prevDelivered) trend = 'down';
        }
        return {
          sprint_number: row.sprint_number,
          velocity: row.committed_points > 0 
            ? (row.delivered_points / row.committed_points) * 100 
            : 0,
          delivered_points: row.delivered_points,
          trend,
          sprint_date: row.sprint_date
        };
      });

      setVelocityTrends(trends);
    } catch (err: any) {
      console.error('Error fetching velocity data:', err);
      setError(err.message || 'Failed to fetch velocity data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchVelocityData();
  }, [fetchVelocityData]);

  // Calculate averages
  const averageVelocity = velocityTrends.length > 0
    ? Math.round(velocityTrends.reduce((sum, t) => sum + t.delivered_points, 0) / velocityTrends.length)
    : 0;

  const averageAccuracy = commitmentData.length > 0
    ? Math.round(commitmentData.reduce((sum, c) => sum + c.accuracy_percentage, 0) / commitmentData.length)
    : 0;

  return {
    commitmentData,
    velocityTrends,
    averageVelocity,
    averageAccuracy,
    isLoading,
    error,
    refresh: fetchVelocityData
  };
};
