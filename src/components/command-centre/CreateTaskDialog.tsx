import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  onSuccess: () => void;
}

const PMI_STAGES = [
  { id: "initiation", label: "Initiation" },
  { id: "planning", label: "Planning" },
  { id: "execution", label: "Execution" },
  { id: "monitoring", label: "Monitoring & Control" },
  { id: "closure", label: "Closure" },
];

const STATUSES = ["Not Started", "To-Do", "In-Progress", "Completed", "Deferred", "Spillover"];

export function CreateTaskDialog({ open, onOpenChange, projectId, onSuccess }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [stage, setStage] = useState("initiation");
  const [notes, setNotes] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    setLoading(true);
    try {
      const depArray = dependencies.trim() 
        ? dependencies.split(',').map(d => d.trim()).filter(d => d) 
        : null;

      const { error } = await supabase.from("pmi_tasks").insert({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
        owner: owner.trim() || null,
        start_date: startDate || null,
        due_date: dueDate || null,
        status,
        stage,
        notes: notes.trim() || null,
        dependencies: depArray,
        progress,
      });

      if (error) throw error;

      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      setOwner("");
      setStartDate("");
      setDueDate("");
      setStatus("Not Started");
      setStage("initiation");
      setNotes("");
      setDependencies("");
      setProgress(0);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">PMI Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PMI_STAGES.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dependencies">Dependencies (comma-separated)</Label>
            <Input
              id="dependencies"
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
              placeholder="Task A, Task B, Task C"
            />
          </div>

          <div>
            <Label htmlFor="progress">Progress: {progress}%</Label>
            <Input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
