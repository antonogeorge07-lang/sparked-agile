import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Archive,
  GitMerge,
  Scissors,
  ArrowUpDown,
  Link2,
  Map,
  Loader2,
} from "lucide-react";
import type { ValidationItem } from "@/hooks/useEpicValidator";

interface RecalibrationActionsPanelProps {
  epicId: string;
  validationRunId: string;
  items: ValidationItem[];
  onLogRecalibration: (
    epicId: string,
    runId: string,
    actionType: string,
    description: string,
    targetFeatureId?: string
  ) => Promise<void>;
}

interface ActionConfig {
  type: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  requiresTarget: boolean;
}

const ACTIONS: ActionConfig[] = [
  {
    type: "archived",
    label: "Archive Feature",
    icon: Archive,
    description: "Remove a feature from the active backlog without deleting it. Ideal for features that are no longer relevant.",
    color: "text-muted-foreground",
    requiresTarget: true,
  },
  {
    type: "merged",
    label: "Merge Features",
    icon: GitMerge,
    description: "Combine two or more overlapping features into a single, unified scope. Reduces duplication.",
    color: "text-blue-600",
    requiresTarget: true,
  },
  {
    type: "rescoped",
    label: "Rescope Feature",
    icon: Scissors,
    description: "Adjust the scope or acceptance criteria of a feature to better align with strategic goals.",
    color: "text-amber-600",
    requiresTarget: true,
  },
  {
    type: "reordered",
    label: "Reorder Priority",
    icon: ArrowUpDown,
    description: "Change the priority ordering of features based on validation insights.",
    color: "text-purple-600",
    requiresTarget: false,
  },
  {
    type: "dependency_updated",
    label: "Update Dependency",
    icon: Link2,
    description: "Add, remove, or modify a dependency between features or external systems.",
    color: "text-cyan-600",
    requiresTarget: true,
  },
  {
    type: "roadmap_updated",
    label: "Update Roadmap",
    icon: Map,
    description: "Adjust the delivery timeline or roadmap based on recalibrated scope.",
    color: "text-emerald-600",
    requiresTarget: false,
  },
];

export function RecalibrationActionsPanel({
  epicId,
  validationRunId,
  items,
  onLogRecalibration,
}: RecalibrationActionsPanelProps) {
  const [selectedAction, setSelectedAction] = useState<ActionConfig | null>(null);
  const [targetFeatureId, setTargetFeatureId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const featureItems = items.filter((i) => i.featureId);

  const handleSubmit = async () => {
    if (!selectedAction || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onLogRecalibration(
        epicId,
        validationRunId,
        selectedAction.type,
        description.trim(),
        targetFeatureId || undefined
      );
      setSelectedAction(null);
      setTargetFeatureId("");
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setTargetFeatureId("");
    setDescription("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recalibration Actions</CardTitle>
          <CardDescription>
            Trigger backlog changes based on validation findings - each action is logged for governance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.type}
                  onClick={() => setSelectedAction(action)}
                  className="group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className={`mt-0.5 ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction && (
                <>
                  <selectedAction.icon className={`h-5 w-5 ${selectedAction.color}`} />
                  {selectedAction.label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAction?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Target Feature Selector */}
            {selectedAction?.requiresTarget && featureItems.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Feature</label>
                <Select value={targetFeatureId} onValueChange={setTargetFeatureId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feature…" />
                  </SelectTrigger>
                  <SelectContent>
                    {featureItems.map((item) => (
                      <SelectItem key={item.featureId!} value={item.featureId!}>
                        <div className="flex items-center gap-2">
                          <span>{item.item}</span>
                          <Badge variant="outline" className="text-xs ml-1">
                            {item.decision}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* All items fallback when no feature IDs */}
            {selectedAction?.requiresTarget && featureItems.length === 0 && items.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Item</label>
                <Select value={targetFeatureId} onValueChange={setTargetFeatureId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item…" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item, idx) => (
                      <SelectItem key={item.id || idx} value={item.id || `item-${idx}`}>
                        {item.item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder={`Describe the ${selectedAction?.label.toLowerCase() || "action"} and why it's needed…`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded in the recalibration audit trail.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging…
                </>
              ) : (
                "Log Action"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
