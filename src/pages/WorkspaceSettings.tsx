import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, Save } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WorkspaceSettings() {
  const navigate = useNavigate();
  const { workspace, loading, updateWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState("");
  const [saving, setSaving] = useState(false);

  // Update local state when workspace loads
  useEffect(() => {
    if (workspace?.name) {
      setWorkspaceName(workspace.name);
    }
  }, [workspace]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateWorkspace({ name: workspaceName });
    setSaving(false);

    if (result?.success) {
      toast({
        title: "Workspace Updated",
        description: "Your workspace settings have been saved.",
      });
    } else {
      toast({
        title: "Error",
        description: result?.error || "Failed to update workspace",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Loading workspace settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BackButton className="mb-6" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workspace Settings</h1>
              <p className="text-muted-foreground">
                Manage your workspace configuration
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Details</CardTitle>
              <CardDescription>
                Basic information about your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace Limits</CardTitle>
              <CardDescription>
                Your current plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Projects</p>
                    <p className="text-sm text-muted-foreground">Maximum allowed projects</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">5</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Team Members</p>
                    <p className="text-sm text-muted-foreground">Maximum team size</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">5</p>
              </div>

              <p className="text-sm text-muted-foreground">
                You're on the Free plan. Need more? Contact support for upgrade options.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
