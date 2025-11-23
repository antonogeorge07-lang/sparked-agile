import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, FolderKanban } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface AssignProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onAssigned: () => void;
}

export function AssignProjectsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onAssigned,
}: AssignProjectsDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (open) {
      loadProjectsAndAssignments();
    }
  }, [open, userId]);

  const loadProjectsAndAssignments = async () => {
    setLoadingProjects(true);
    try {
      // Load all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, description")
        .order("name");

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Load user's existing project assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", userId);

      if (assignmentsError) throw assignmentsError;
      const assignedIds = assignments?.map((a) => a.project_id) || [];
      setExistingAssignments(assignedIds);
      setSelectedProjects(assignedIds);
    } catch (error: any) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      // Remove old assignments
      const toRemove = existingAssignments.filter(
        (id) => !selectedProjects.includes(id)
      );
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("project_members")
          .delete()
          .eq("user_id", userId)
          .in("project_id", toRemove);

        if (deleteError) throw deleteError;
      }

      // Add new assignments
      const toAdd = selectedProjects.filter(
        (id) => !existingAssignments.includes(id)
      );
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("project_members")
          .insert(
            toAdd.map((projectId) => ({
              user_id: userId,
              project_id: projectId,
              role: "member",
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success(`Project assignments updated for ${userName}`);
      onAssigned();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error assigning projects:", error);
      toast.error("Failed to assign projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Assign Projects to {userName}
          </DialogTitle>
          <DialogDescription>
            Select which projects this user should have access to. They'll be able to view and work on assigned projects.
          </DialogDescription>
        </DialogHeader>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No projects available</p>
            <p className="text-sm mt-2">Create a project first to assign users to it</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleToggleProject(project.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`project-${project.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {project.name}
                    </Label>
                    {project.description && (
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || projects.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedProjects.length} Project{selectedProjects.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
