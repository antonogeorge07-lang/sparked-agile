import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateEpicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  valueStreams: any[];
  onSuccess: () => void;
}

export function CreateEpicDialog({ open, onOpenChange, projectId, valueStreams, onSuccess }: CreateEpicDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Step 1: Basic Information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [valueStreamId, setValueStreamId] = useState("");

  // Step 2: Business Case
  const [businessJustification, setBusinessJustification] = useState("");
  const [strategicGoals, setStrategicGoals] = useState<string[]>([""]);
  const [priority, setPriority] = useState("medium");
  const [businessValue, setBusinessValue] = useState([50]);

  // Step 3: Acceptance Criteria
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([""]);

  // Step 4: Planning
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [effortEstimate, setEffortEstimate] = useState("");
  const [roiScore, setRoiScore] = useState("");

  // Step 5: Team Assignment
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);

  const totalSteps = 5;

  useEffect(() => {
    if (open) {
      resetForm();
      loadTeamMembers();
    }
  }, [open, projectId]);

  const resetForm = () => {
    setCurrentStep(1);
    setTitle("");
    setDescription("");
    setValueStreamId("");
    setBusinessJustification("");
    setStrategicGoals([""]);
    setPriority("medium");
    setBusinessValue([50]);
    setAcceptanceCriteria([""]);
    setStartDate("");
    setEndDate("");
    setEffortEstimate("");
    setRoiScore("");
    setSelectedStakeholders([]);
  };

  const loadTeamMembers = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('project_members')
      .select(`
        user_id,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading team members:', error);
    } else {
      setTeamMembers(data || []);
    }
  };

  const addStrategicGoal = () => {
    setStrategicGoals([...strategicGoals, ""]);
  };

  const removeStrategicGoal = (index: number) => {
    setStrategicGoals(strategicGoals.filter((_, i) => i !== index));
  };

  const updateStrategicGoal = (index: number, value: string) => {
    const newGoals = [...strategicGoals];
    newGoals[index] = value;
    setStrategicGoals(newGoals);
  };

  const addAcceptanceCriterion = () => {
    setAcceptanceCriteria([...acceptanceCriteria, ""]);
  };

  const removeAcceptanceCriterion = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  const updateAcceptanceCriterion = (index: number, value: string) => {
    const newCriteria = [...acceptanceCriteria];
    newCriteria[index] = value;
    setAcceptanceCriteria(newCriteria);
  };

  const toggleStakeholder = (userId: string) => {
    if (selectedStakeholders.includes(userId)) {
      setSelectedStakeholders(selectedStakeholders.filter(id => id !== userId));
    } else {
      setSelectedStakeholders([...selectedStakeholders, userId]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return title.trim() !== "" && description.trim() !== "" && valueStreamId !== "";
      case 2:
        return businessJustification.trim() !== "";
      case 3:
        return acceptanceCriteria.some(ac => ac.trim() !== "");
      case 4:
        return true; // Planning step is optional
      case 5:
        return true; // Team assignment is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Filter out empty values
      const filteredGoals = strategicGoals.filter(g => g.trim() !== "");
      const filteredCriteria = acceptanceCriteria.filter(ac => ac.trim() !== "");

      const epicData = {
        title,
        description,
        value_stream_id: valueStreamId,
        business_justification: businessJustification,
        strategic_goals: filteredGoals,
        priority,
        business_value: businessValue[0],
        acceptance_criteria: filteredCriteria,
        start_date: startDate || null,
        end_date: endDate || null,
        effort_estimate: effortEstimate ? parseInt(effortEstimate) : null,
        roi_score: roiScore ? parseFloat(roiScore) : null,
        created_by: user.id,
        status: 'backlog',
        health_score: 'on_track'
      };

      const { data: epic, error: epicError } = await supabase
        .from('epics')
        .insert(epicData)
        .select()
        .single();

      if (epicError) throw epicError;

      // Add stakeholders
      if (selectedStakeholders.length > 0 && epic) {
        const stakeholderData = selectedStakeholders.map(userId => ({
          epic_id: epic.id,
          user_id: userId,
          role: 'stakeholder'
        }));

        const { error: stakeholderError } = await supabase
          .from('epic_stakeholders')
          .insert(stakeholderData);

        if (stakeholderError) {
          console.error('Error adding stakeholders:', stakeholderError);
        }
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating epic:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create epic",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Epic - Step {currentStep}/{totalSteps}</DialogTitle>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Epic Name *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mobile App Launch"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the epic in detail..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="valueStream">Value Stream *</Label>
                <Select value={valueStreamId} onValueChange={setValueStreamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {valueStreams.map(vs => (
                      <SelectItem key={vs.id} value={vs.id}>
                        {vs.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Business Case */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessJustification">Business Justification *</Label>
                <Textarea
                  id="businessJustification"
                  value={businessJustification}
                  onChange={(e) => setBusinessJustification(e.target.value)}
                  placeholder="Why is this epic important? What business value does it deliver?"
                  rows={4}
                />
              </div>

              <div>
                <Label>Strategic Goals</Label>
                {strategicGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateStrategicGoal(index, e.target.value)}
                      placeholder="e.g., Increase market share"
                    />
                    {strategicGoals.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStrategicGoal(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStrategicGoal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Slider
                  value={businessValue}
                  onValueChange={setBusinessValue}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 3: Acceptance Criteria */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Acceptance Criteria *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Define the criteria that must be met for this epic to be considered complete
                </p>
                {acceptanceCriteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={criterion}
                      onChange={(e) => updateAcceptanceCriterion(index, e.target.value)}
                      placeholder="e.g., All core features implemented and tested"
                    />
                    {acceptanceCriteria.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAcceptanceCriterion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addAcceptanceCriterion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criterion
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Planning */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Target End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="effortEstimate">Effort Estimate (Story Points)</Label>
                <Input
                  id="effortEstimate"
                  type="number"
                  value={effortEstimate}
                  onChange={(e) => setEffortEstimate(e.target.value)}
                  placeholder="e.g., 89"
                />
              </div>

              <div>
                <Label htmlFor="roiScore">Expected ROI Score</Label>
                <Input
                  id="roiScore"
                  type="number"
                  step="0.1"
                  value={roiScore}
                  onChange={(e) => setRoiScore(e.target.value)}
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>
          )}

          {/* Step 5: Team Assignment */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <Label>Stakeholders</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select team members who should be involved in this epic
                </p>
                <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members found</p>
                  ) : (
                    teamMembers.map(member => (
                      <label
                        key={member.user_id}
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStakeholders.includes(member.user_id)}
                          onChange={() => toggleStakeholder(member.user_id)}
                          className="rounded"
                        />
                        <span className="flex-1">
                          {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed() || loading}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Epic
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
