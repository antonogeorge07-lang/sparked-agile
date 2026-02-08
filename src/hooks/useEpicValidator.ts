import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ValidationItem {
  id?: string;
  item: string;
  status: string;
  decision: 'implement' | 'review' | 'do_not_implement';
  finalDecision?: 'implement' | 'review' | 'do_not_implement' | 'merged' | 'archived' | null;
  reasoning: string;
  recommendation: string;
  stakeholderNotes?: string;
  featureId?: string | null;
}

export interface EffortAnalysis {
  totalEstimatedPoints: number | null;
  implementPoints: number | null;
  reviewPoints: number | null;
  removePoints: number | null;
  potentialSavings: string;
}

export interface EpicValidationResult {
  epicSummary: string;
  validationItems: ValidationItem[];
  deliveryAlignmentCheck: string;
  verdict: {
    alignment: 'aligned' | 'misaligned' | 'requires_review';
    summary: string;
  };
  nextSteps: string[];
  effortAnalysis: EffortAnalysis;
}

export interface ValidationRun {
  id: string;
  epic_id: string;
  run_by: string;
  status: 'pending_review' | 'stakeholder_review' | 'approved' | 'rejected' | 'recalibrated';
  ai_summary: string | null;
  verdict_alignment: string | null;
  verdict_summary: string | null;
  delivery_alignment_check: string | null;
  effort_analysis: any;
  next_steps: string[];
  features_analysed: number;
  dependencies_checked: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationMetadata {
  epicId: string;
  featuresAnalysed: number;
  dependenciesChecked: number;
  validatedAt: string;
}

export interface ReadinessCheck {
  id: string;
  epic_id: string;
  check_type: string;
  check_name: string;
  is_passed: boolean;
  notes: string | null;
  checked_by: string | null;
  checked_at: string | null;
}

export interface RecalibrationEntry {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  target_feature_id: string | null;
}

export function useEpicValidator(epicId?: string) {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<EpicValidationResult | null>(null);
  const [metadata, setMetadata] = useState<ValidationMetadata | null>(null);
  const [validationRunId, setValidationRunId] = useState<string | null>(null);
  const [runs, setRuns] = useState<ValidationRun[]>([]);
  const [activeRun, setActiveRun] = useState<ValidationRun | null>(null);
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([]);
  const [readinessChecks, setReadinessChecks] = useState<ReadinessCheck[]>([]);
  const [recalibrationLog, setRecalibrationLog] = useState<RecalibrationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing validation runs for this epic
  const loadRuns = useCallback(async (eid: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('epic_validation_runs')
        .select('*')
        .eq('epic_id', eid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Cast to the correct type since DB returns generic types
      const typedRuns = (data || []) as unknown as ValidationRun[];
      setRuns(typedRuns);
      
      if (typedRuns.length > 0) {
        const latest = typedRuns[0];
        setActiveRun(latest);
        setValidationRunId(latest.id);
        
        // Reconstruct the result from the stored run
        setResult({
          epicSummary: latest.ai_summary || '',
          validationItems: [],
          deliveryAlignmentCheck: latest.delivery_alignment_check || '',
          verdict: {
            alignment: (latest.verdict_alignment as any) || 'requires_review',
            summary: latest.verdict_summary || '',
          },
          nextSteps: latest.next_steps || [],
          effortAnalysis: latest.effort_analysis || {},
        });
        setMetadata({
          epicId: eid,
          featuresAnalysed: latest.features_analysed,
          dependenciesChecked: latest.dependencies_checked,
          validatedAt: latest.created_at,
        });
        
        // Load items for this run
        await loadRunItems(latest.id);
        await loadReadinessChecks(eid, latest.id);
        await loadRecalibrationLog(latest.id);
      }
    } catch (err) {
      console.error('Failed to load validation runs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRunItems = useCallback(async (runId: string) => {
    const { data, error } = await supabase
      .from('epic_validation_items')
      .select('*')
      .eq('validation_run_id', runId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load validation items:', error);
      return;
    }

    const mapped: ValidationItem[] = (data || []).map((d: any) => ({
      id: d.id,
      item: d.item_name,
      status: d.current_status || '',
      decision: d.ai_decision,
      finalDecision: d.final_decision,
      reasoning: d.ai_reasoning || '',
      recommendation: d.ai_recommendation || '',
      stakeholderNotes: d.stakeholder_notes || '',
      featureId: d.feature_id,
    }));

    setValidationItems(mapped);
    
    // Also update the result's items
    setResult(prev => prev ? { ...prev, validationItems: mapped } : prev);
  }, []);

  const loadReadinessChecks = useCallback(async (eid: string, runId?: string) => {
    let query = supabase
      .from('epic_readiness_checks')
      .select('*')
      .eq('epic_id', eid)
      .order('created_at', { ascending: true });

    if (runId) {
      query = query.eq('validation_run_id', runId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to load readiness checks:', error);
      return;
    }
    setReadinessChecks((data || []) as unknown as ReadinessCheck[]);
  }, []);

  const loadRecalibrationLog = useCallback(async (runId: string) => {
    const { data, error } = await supabase
      .from('epic_recalibration_log')
      .select('*')
      .eq('validation_run_id', runId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load recalibration log:', error);
      return;
    }
    setRecalibrationLog((data || []) as unknown as RecalibrationEntry[]);
  }, []);

  // Load on mount if epicId provided
  useEffect(() => {
    if (epicId) {
      loadRuns(epicId);
    }
  }, [epicId, loadRuns]);

  // Run new validation
  const validate = useCallback(async (eid: string) => {
    setIsValidating(true);
    setResult(null);
    setMetadata(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-epic-implementation', {
        body: { epicId: eid },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Validation failed');

      setResult(data.validation);
      setMetadata(data.metadata);
      setValidationRunId(data.validationRunId);
      
      // Reload everything
      await loadRuns(eid);
      
      toast.success('Epic implementation validation complete - results stored');
      return data.validation;
    } catch (err: any) {
      const message = err?.message || 'Validation request failed';
      if (message.includes('Rate limit')) {
        toast.error('AI is busy. Please try again in a moment.');
      } else if (message.includes('credits')) {
        toast.error('AI credits exhausted. Please add funds.');
      } else {
        toast.error(message);
      }
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [loadRuns]);

  // Stakeholder decision on an item
  const setItemDecision = useCallback(async (
    itemId: string,
    finalDecision: 'implement' | 'review' | 'do_not_implement' | 'merged' | 'archived',
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('epic_validation_items')
        .update({
          final_decision: finalDecision,
          stakeholder_notes: notes || null,
          decided_by: user?.id,
          decided_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;
      
      setValidationItems(prev =>
        prev.map(i => i.id === itemId ? { ...i, finalDecision: finalDecision, stakeholderNotes: notes || '' } : i)
      );
      toast.success('Decision recorded');
    } catch (err) {
      toast.error('Failed to update decision');
    }
  }, []);

  // Update run status (stakeholder review flow)
  const updateRunStatus = useCallback(async (
    runId: string,
    status: ValidationRun['status'],
    reviewNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('epic_validation_runs')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        })
        .eq('id', runId);

      if (error) throw error;
      
      setActiveRun(prev => prev ? { ...prev, status, review_notes: reviewNotes || null } : prev);
      toast.success(`Validation ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  }, []);

  // Toggle readiness check
  const toggleReadinessCheck = useCallback(async (checkId: string, isPassed: boolean, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('epic_readiness_checks')
        .update({
          is_passed: isPassed,
          notes: notes || null,
          checked_by: user?.id,
          checked_at: new Date().toISOString(),
        })
        .eq('id', checkId);

      if (error) throw error;
      
      setReadinessChecks(prev =>
        prev.map(c => c.id === checkId ? { ...c, is_passed: isPassed, notes: notes || null } : c)
      );
    } catch (err) {
      toast.error('Failed to update readiness check');
    }
  }, []);

  // Log a recalibration action
  const logRecalibration = useCallback(async (
    eid: string,
    runId: string,
    actionType: string,
    description: string,
    targetFeatureId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('epic_recalibration_log')
        .insert({
          validation_run_id: runId,
          epic_id: eid,
          action_type: actionType,
          description,
          target_feature_id: targetFeatureId || null,
          performed_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRecalibrationLog(prev => [data as unknown as RecalibrationEntry, ...prev]);
      toast.success('Recalibration logged');
    } catch (err) {
      toast.error('Failed to log recalibration');
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setMetadata(null);
    setValidationRunId(null);
    setActiveRun(null);
  }, []);

  return {
    isValidating,
    isLoading,
    result,
    metadata,
    validationRunId,
    runs,
    activeRun,
    validationItems,
    readinessChecks,
    recalibrationLog,
    validate,
    loadRuns,
    setItemDecision,
    updateRunStatus,
    toggleReadinessCheck,
    logRecalibration,
    reset,
  };
}
