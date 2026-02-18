import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TestScenario {
  title: string;
  description: string;
  type: 'happy_path' | 'edge_case' | 'negative' | 'performance' | 'security' | 'accessibility';
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: string[];
  expected_result: string;
  preconditions?: string;
}

interface UseTestScenariosReturn {
  isGenerating: boolean;
  scenarios: TestScenario[];
  scenarioId: string | null;
  generate: (params: {
    projectId: string;
    userStory: string;
    acceptanceCriteria?: string;
    backlogItemId?: string;
  }) => Promise<TestScenario[]>;
  loadSaved: (projectId: string) => Promise<void>;
  savedScenarios: Array<{
    id: string;
    user_story: string;
    generated_scenarios: TestScenario[];
    scenario_count: number;
    status: string;
    created_at: string;
  }>;
}

export function useTestScenarios(): UseTestScenariosReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  const generate = useCallback(async (params: {
    projectId: string;
    userStory: string;
    acceptanceCriteria?: string;
    backlogItemId?: string;
  }): Promise<TestScenario[]> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-test-scenarios', {
        body: params,
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return [];
      }
      setScenarios(data.scenarios);
      setScenarioId(data.scenarioId);
      toast.success(`${data.count} test scenarios generated`);
      return data.scenarios;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate test scenarios');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const loadSaved = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_test_scenarios')
        .select('id, user_story, generated_scenarios, scenario_count, status, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setSavedScenarios(data || []);
    } catch (err) {
      console.error('Failed to load saved scenarios:', err);
    }
  }, []);

  return { isGenerating, scenarios, scenarioId, generate, loadSaved, savedScenarios };
}
