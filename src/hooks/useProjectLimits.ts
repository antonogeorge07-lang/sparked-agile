import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectLimitInfo {
  currentCount: number;
  limitCount: number;
  canCreate: boolean;
  tierName: string;
}

export function useProjectLimits() {
  const [limitInfo, setLimitInfo] = useState<ProjectLimitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('get_project_limit_info', { user_id_param: user.id });

      if (error) {
        console.error('Error checking project limits:', error);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setLimitInfo({
          currentCount: result.current_count,
          limitCount: result.limit_count,
          canCreate: result.can_create,
          tierName: result.tier_name
        });
      }
    } catch (error) {
      console.error('Error in useProjectLimits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLimits();
  }, []);

  return {
    ...limitInfo,
    isLoading,
    refresh: checkLimits,
  };
}