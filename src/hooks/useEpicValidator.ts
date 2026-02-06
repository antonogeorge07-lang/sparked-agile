import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ValidationItem {
  item: string;
  status: string;
  decision: 'implement' | 'review' | 'do_not_implement';
  reasoning: string;
  recommendation: string;
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

export interface ValidationMetadata {
  epicId: string;
  featuresAnalysed: number;
  dependenciesChecked: number;
  validatedAt: string;
}

export function useEpicValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<EpicValidationResult | null>(null);
  const [metadata, setMetadata] = useState<ValidationMetadata | null>(null);

  const validate = useCallback(async (epicId: string) => {
    setIsValidating(true);
    setResult(null);
    setMetadata(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-epic-implementation', {
        body: { epicId },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Validation failed');
      }

      setResult(data.validation);
      setMetadata(data.metadata);
      toast.success('Epic implementation validation complete');
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
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setMetadata(null);
  }, []);

  return {
    isValidating,
    result,
    metadata,
    validate,
    reset,
  };
}
