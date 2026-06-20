import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FolderPlus, Rocket, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";

interface FirstProjectPromptProps {
  onProjectCreated: () => void;
}

export function FirstProjectPrompt({ onProjectCreated }: FirstProjectPromptProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const { workspace } = useWorkspace();

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
      if (!workspace?.id) {
        toast.error("Workspace is still loading. Please try again in a moment.");
        return;
      }

      // Write to the canonical `projects` table that My Projects & every other
      // page reads from. workspace_id + user_id are mandatory for RLS.
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          user_id: user.id,
          workspace_id: workspace.id,
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Create project failed:', error);
        toast.error(error.message || "Failed to create project");
        return;
      }
      if (!data?.id) {
        toast.error("Project was not created. Please try again.");
        return;
      }

      toast.success("Project created. Let's get started.");
      onProjectCreated();
    } catch (err: any) {
      console.error('Create project exception:', err);
      toast.error(err.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-fit p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 mb-4">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create Your First Project</CardTitle>
        <CardDescription className="text-base max-w-md mx-auto">
          Get started by creating a project. You can connect tools, plan sprints, and track progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-md mx-auto space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="e.g. Mobile App Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-desc">Description (optional)</Label>
          <Textarea
            id="project-desc"
            placeholder="Brief description of your project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          onClick={handleCreate}
          disabled={creating || !name.trim() || !workspace?.id}
          className="w-full gap-2"
          size="lg"
        >
          <FolderPlus className="w-4 h-4" />
          {creating ? "Creating..." : "Create Project"}
          {!creating && <ArrowRight className="w-4 h-4" />}
        </Button>
      </CardContent>
    </Card>
  );
}
