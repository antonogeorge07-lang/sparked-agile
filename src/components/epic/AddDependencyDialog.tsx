import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Epic {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface AddDependencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEpicId: string;
  availableEpics: Epic[];
  onDependencyAdded: () => void;
}

export function AddDependencyDialog({
  open,
  onOpenChange,
  currentEpicId,
  availableEpics,
  onDependencyAdded,
}: AddDependencyDialogProps) {
  const [selectedEpic, setSelectedEpic] = useState("");
  const [dependencyType, setDependencyType] = useState("blocks");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedEpic) {
      toast({
        title: "Error",
        description: "Please select an epic",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('epic_dependencies')
        .insert({
          epic_id: currentEpicId,
          depends_on_epic_id: selectedEpic,
          dependency_type: dependencyType,
          description: description || null,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Dependency added",
        description: "Epic dependency has been created",
      });

      setSelectedEpic("");
      setDependencyType("blocks");
      setDescription("");
      onOpenChange(false);
      onDependencyAdded();
    } catch (error: any) {
      console.error('Error adding dependency:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add dependency",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Epic Dependency</DialogTitle>
          <DialogDescription>
            Define how this epic relates to or depends on another epic
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="epic">Depends On Epic</Label>
            <select
              id="epic"
              value={selectedEpic}
              onChange={(e) => setSelectedEpic(e.target.value)}
              className="w-full h-10 px-3 border rounded-md bg-background"
            >
              <option value="">Select an epic...</option>
              {availableEpics.map(epic => (
                <option key={epic.id} value={epic.id}>
                  {epic.title} ({epic.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Dependency Type</Label>
            <select
              id="type"
              value={dependencyType}
              onChange={(e) => setDependencyType(e.target.value)}
              className="w-full h-10 px-3 border rounded-md bg-background"
            >
              <option value="blocks">Blocks - Must complete before this epic</option>
              <option value="relates_to">Relates To - Related but not blocking</option>
              <option value="duplicates">Duplicates - Duplicate of another epic</option>
              <option value="precedes">Precedes - Should be completed before</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Explain the dependency relationship..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Dependency"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
