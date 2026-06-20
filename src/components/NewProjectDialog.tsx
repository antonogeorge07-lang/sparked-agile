import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string | undefined;
  onCreated: () => void;
}

/**
 * Creates a project in the canonical `projects` table.
 * workspace_id + user_id are mandatory for RLS, so the dialog
 * refuses to submit until the workspace is known.
 */
export function NewProjectDialog({ open, onOpenChange, workspaceId, onCreated }: NewProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setCreating(true);
    try {
      // Always re-check session before mutating (Data Resilience standard)
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        toast.error("Please sign in to create a project");
        return;
      }
      if (!workspaceId) {
        toast.error("Workspace is still loading. Please try again in a moment.");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: user.id,
          workspace_id: workspaceId,
        })
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Create project failed:", error);
        toast.error(error.message || "Failed to create project");
        return;
      }
      if (!data?.id) {
        toast.error("Project was not created. Please try again.");
        return;
      }

      toast.success("Project created");
      setName("");
      setDescription("");
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      console.error("Create project exception:", err);
      toast.error(err.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Add a project to your workspace. You can connect tools and plan sprints once it is created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-project-name">Project Name</Label>
            <Input
              id="new-project-name"
              placeholder="e.g. Mobile App Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-project-desc">Description (optional)</Label>
            <Textarea
              id="new-project-desc"
              placeholder="Brief description of your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim() || !workspaceId} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
