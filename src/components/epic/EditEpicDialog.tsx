import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditEpicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epic: any;
  valueStreams: any[];
  onSuccess: () => void;
}

export function EditEpicDialog({ open, onOpenChange, epic, valueStreams, onSuccess }: EditEpicDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jiraEpicKey, setJiraEpicKey] = useState("");
  const [valueStreamId, setValueStreamId] = useState("");
  const [businessJustification, setBusinessJustification] = useState("");
  const [strategicGoals, setStrategicGoals] = useState<string[]>([""]);
  const [priority, setPriority] = useState("medium");
  const [businessValue, setBusinessValue] = useState([50]);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([""]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [effortEstimate, setEffortEstimate] = useState("");
  const [roiScore, setRoiScore] = useState("");
  const [status, setStatus] = useState("backlog");

  const totalSteps = 4;

  useEffect(() => {
    if (open && epic) {
      setTitle(epic.title || "");
      setDescription(epic.description || "");
      setJiraEpicKey(epic.jira_epic_key || "");
      setValueStreamId(epic.value_stream_id || "");
      setBusinessJustification(epic.business_justification || "");
      setStrategicGoals(epic.strategic_goals?.length ? epic.strategic_goals : [""]);
      setPriority(epic.priority || "medium");
      setBusinessValue([epic.business_value || 50]);
      setAcceptanceCriteria(epic.acceptance_criteria?.length ? epic.acceptance_criteria : [""]);
      setStartDate(epic.start_date || "");
      setEndDate(epic.end_date || "");
      setEffortEstimate(epic.effort_estimate?.toString() || "");
      setRoiScore(epic.roi_score?.toString() || "");
      setStatus(epic.status || "backlog");
      setCurrentStep(1);
    }
  }, [open, epic]);

  const addStrategicGoal = () => setStrategicGoals([...strategicGoals, ""]);
  const removeStrategicGoal = (i: number) => setStrategicGoals(strategicGoals.filter((_, idx) => idx !== i));
  const updateStrategicGoal = (i: number, v: string) => {
    const g = [...strategicGoals]; g[i] = v; setStrategicGoals(g);
  };

  const addCriterion = () => setAcceptanceCriteria([...acceptanceCriteria, ""]);
  const removeCriterion = (i: number) => setAcceptanceCriteria(acceptanceCriteria.filter((_, idx) => idx !== i));
  const updateCriterion = (i: number, v: string) => {
    const c = [...acceptanceCriteria]; c[i] = v; setAcceptanceCriteria(c);
  };

  const canProceed = () => {
    if (currentStep === 1) return title.trim() && description.trim() && valueStreamId;
    if (currentStep === 2) return businessJustification.trim();
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('epics')
        .update({
          title,
          description,
          value_stream_id: valueStreamId,
          business_justification: businessJustification,
          strategic_goals: strategicGoals.filter(g => g.trim()),
          priority,
          business_value: businessValue[0],
          acceptance_criteria: acceptanceCriteria.filter(ac => ac.trim()),
          start_date: startDate || null,
          end_date: endDate || null,
          effort_estimate: effortEstimate ? parseInt(effortEstimate) : null,
          roi_score: roiScore ? parseFloat(roiScore) : null,
          status,
          jira_epic_key: jiraEpicKey.trim() || null,
        })
        .eq('id', epic.id);

      if (error) throw error;
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update epic", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Epic - Step {currentStep}/{totalSteps}</DialogTitle>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Epic Name *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Value Stream *</Label>
                <Select value={valueStreamId} onValueChange={setValueStreamId}>
                  <SelectTrigger><SelectValue placeholder="Select value stream" /></SelectTrigger>
                  <SelectContent>
                    {valueStreams.map(vs => (
                      <SelectItem key={vs.id} value={vs.id}>{vs.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jira Epic Key</Label>
                <Input 
                  value={jiraEpicKey} 
                  onChange={(e) => setJiraEpicKey(e.target.value)} 
                  placeholder="e.g. PROJ-123"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link this epic to a Jira epic to enable feature sync
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Business Justification *</Label>
                <Textarea value={businessJustification} onChange={(e) => setBusinessJustification(e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Strategic Goals</Label>
                {strategicGoals.map((goal, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={goal} onChange={(e) => updateStrategicGoal(i, e.target.value)} placeholder="Strategic goal" />
                    {strategicGoals.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeStrategicGoal(i)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStrategicGoal}><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Business Value: {businessValue[0]}/100</Label>
                <Slider value={businessValue} onValueChange={setBusinessValue} min={0} max={100} step={5} className="mt-2" />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Label>Acceptance Criteria</Label>
              {acceptanceCriteria.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={c} onChange={(e) => updateCriterion(i, e.target.value)} placeholder="Acceptance criterion" />
                  {acceptanceCriteria.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeCriterion(i)}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCriterion}><Plus className="h-4 w-4 mr-2" />Add Criterion</Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Target End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Effort Estimate (Story Points)</Label>
                <Input type="number" value={effortEstimate} onChange={(e) => setEffortEstimate(e.target.value)} />
              </div>
              <div>
                <Label>Expected ROI Score</Label>
                <Input type="number" step="0.1" value={roiScore} onChange={(e) => setRoiScore(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1 || loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={() => setCurrentStep(s => s + 1)} disabled={!canProceed()}>
              Next<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
