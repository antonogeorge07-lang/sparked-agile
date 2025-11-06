import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  owner: string | null;
  start_date: string | null;
  due_date: string | null;
  status: string;
  stage: string;
  notes: string | null;
  dependencies: string[] | null;
  progress: number;
}

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
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

export function EditTaskDialog({ open, onOpenChange, task, onSuccess }: EditTaskDialogProps) {
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

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setOwner(task.owner || "");
      setStartDate(task.start_date || "");
      setDueDate(task.due_date || "");
      setStatus(task.status);
      setStage(task.stage);
      setNotes(task.notes || "");
      setDependencies(task.dependencies?.join(", ") || "");
      setProgress(task.progress || 0);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setLoading(true);
    try {
      const depArray = dependencies.trim() 
        ? dependencies.split(',').map(d => d.trim()).filter(d => d) 
        : null;

      const { error } = await supabase
        .from("pmi_tasks")
        .update({
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
        })
        .eq("id", task.id);

      if (error) throw error;

      toast.success("Task updated successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
