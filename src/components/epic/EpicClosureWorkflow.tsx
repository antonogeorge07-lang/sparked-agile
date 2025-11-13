import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle, XCircle, Clock, AlertCircle, FileCheck, 
  Loader2, Sparkles, Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface ClosureReview {
  id: string;
  closure_status: string;
  closure_date: string | null;
  review_notes: string | null;
  checklist_items: any[];
}

interface ReadinessData {
  readiness_score: number;
  ready_to_close: boolean;
  blockers: any[];
  feature_completion: number;
  milestone_completion: number;
}

interface EpicClosureWorkflowProps {
  epicId: string;
  onClosureUpdate?: () => void;
}

export function EpicClosureWorkflow({ epicId, onClosureUpdate }: EpicClosureWorkflowProps) {
  const [closureReview, setClosureReview] = useState<ClosureReview | null>(null);
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadClosure();
    loadReadiness();
  }, [epicId]);

  const loadClosure = async () => {
    try {
      const { data, error } = await supabase
        .from('epic_closure_reviews')
        .select('*')
        .eq('epic_id', epicId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const checklistItems = Array.isArray(data.checklist_items) 
          ? data.checklist_items 
          : JSON.parse(data.checklist_items as string || '[]');
          
        setClosureReview({
          ...data,
          checklist_items: checklistItems
        } as ClosureReview);
        setReviewNotes(data.review_notes || '');
      }
    } catch (error: any) {
      console.error('Error loading closure:', error);
    }
  };

  const loadReadiness = async () => {
    try {
      const { data, error } = await supabase.rpc('calculate_closure_readiness', {
        epic_id_param: epicId
      });

      if (error) throw error;
      
      if (data) {
        const readinessData = typeof data === 'string' ? JSON.parse(data) : data;
        setReadiness(readinessData as ReadinessData);
      }
    } catch (error: any) {
      console.error('Error loading readiness:', error);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const { data, error } = await supabase.rpc('initialize_epic_closure_review', {
        epic_id_param: epicId
      });

      if (error) throw error;

      await loadClosure();
      await loadReadiness();

      toast({
        title: "Closure review initialized",
        description: "Default checklist has been created",
      });
    } catch (error: any) {
      console.error('Error initializing:', error);
      toast({
        title: "Error",
        description: "Failed to initialize closure review",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
    if (!closureReview) return;

    try {
      const updatedChecklist = closureReview.checklist_items.map(item =>
        item.id === itemId ? { ...item, completed } : item
      );

      const { error } = await supabase
        .from('epic_closure_reviews')
        .update({ checklist_items: updatedChecklist })
        .eq('id', closureReview.id);

      if (error) throw error;

      await loadClosure();
      await loadReadiness();
    } catch (error: any) {
      console.error('Error updating checklist:', error);
      toast({
        title: "Error",
        description: "Failed to update checklist",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-epic-closure-insights', {
        body: { epicId, type: 'closure_summary' }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedSummary(data.content);
        setReviewNotes(data.content);
        
        toast({
          title: "Summary generated",
          description: "AI closure summary has been created",
        });
      }
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!closureReview) return;

    try {
      const { error } = await supabase
        .from('epic_closure_reviews')
        .update({ review_notes: reviewNotes })
        .eq('id', closureReview.id);

      if (error) throw error;

      toast({
        title: "Notes saved",
        description: "Review notes have been updated",
      });
    } catch (error: any) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const handleSubmitForReview = async () => {
    if (!closureReview) return;

    try {
      const { error } = await supabase
        .from('epic_closure_reviews')
        .update({ closure_status: 'in_review' })
        .eq('id', closureReview.id);

      if (error) throw error;

      await loadClosure();
      onClosureUpdate?.();

      toast({
        title: "Submitted for review",
        description: "Epic closure is now pending approval",
      });
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast({
        title: "Error",
        description: "Failed to submit for review",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async () => {
    if (!closureReview) return;

    try {
      const { error } = await supabase
        .from('epic_closure_reviews')
        .update({ 
          closure_status: 'approved',
          closure_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', closureReview.id);

      if (error) throw error;

      await loadClosure();
      onClosureUpdate?.();

      toast({
        title: "Epic closed",
        description: "Epic has been successfully closed",
      });
    } catch (error: any) {
      console.error('Error approving:', error);
      toast({
        title: "Error",
        description: "Failed to approve closure",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    if (!closureReview) return <Clock className="h-6 w-6 text-muted-foreground" />;
    
    switch (closureReview.closure_status) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'in_review':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <FileCheck className="h-6 w-6 text-blue-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!closureReview) return <Badge variant="outline">Not Started</Badge>;
    
    switch (closureReview.closure_status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'in_review':
        return <Badge className="bg-yellow-500/10 text-yellow-500">In Review</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (!closureReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Epic Closure Workflow</CardTitle>
          <CardDescription>
            Initialize the closure process to review and approve epic completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Closure review not started</p>
            <Button onClick={handleInitialize} disabled={isInitializing}>
              {isInitializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Initialize Closure Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedItems = closureReview.checklist_items.filter(item => item.completed).length;
  const totalItems = closureReview.checklist_items.length;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle>Closure Status</CardTitle>
                <CardDescription>
                  {closureReview.closure_date 
                    ? `Closed on ${format(new Date(closureReview.closure_date), 'MMM d, yyyy')}`
                    : 'In progress'
                  }
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        {readiness && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Closure Readiness</span>
                  <span className="text-sm text-muted-foreground">{readiness.readiness_score}/100</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      readiness.readiness_score >= 80 ? 'bg-green-500' :
                      readiness.readiness_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${readiness.readiness_score}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Features</p>
                  <p className="text-xl font-bold">{readiness.feature_completion}%</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Milestones</p>
                  <p className="text-xl font-bold">{readiness.milestone_completion}%</p>
                </div>
              </div>

              {readiness.blockers && readiness.blockers.length > 0 && (
                <div className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <p className="font-semibold text-sm">Blockers</p>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {readiness.blockers.map((blocker: any, index: number) => (
                      <li key={index}>
                        • {blocker.type === 'incomplete_features' 
                          ? `${blocker.remaining} incomplete feature(s)`
                          : blocker.type === 'missed_milestones'
                          ? `${blocker.count} missed milestone(s)`
                          : blocker.message || 'Unknown blocker'
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Closure Checklist</CardTitle>
              <CardDescription>
                Complete all items before closing the epic
              </CardDescription>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems} completed
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {closureReview.checklist_items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => handleChecklistToggle(item.id, !!checked)}
                disabled={closureReview.closure_status === 'approved'}
              />
              <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                {item.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Review Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Closure Summary</CardTitle>
              <CardDescription>
                Document achievements, deliverables, and outcomes
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Document the epic closure, including achievements, key deliverables, challenges overcome, and final outcomes..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={8}
            disabled={closureReview.closure_status === 'approved'}
          />
          
          {closureReview.closure_status !== 'approved' && (
            <Button onClick={handleSaveNotes} variant="outline">
              Save Notes
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {closureReview.closure_status !== 'approved' && (
        <div className="flex gap-3 justify-end">
          {closureReview.closure_status === 'pending' && (
            <Button 
              onClick={handleSubmitForReview}
              disabled={completedItems < totalItems}
            >
              Submit for Review
            </Button>
          )}
          
          {closureReview.closure_status === 'in_review' && readiness?.ready_to_close && (
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Close Epic
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
