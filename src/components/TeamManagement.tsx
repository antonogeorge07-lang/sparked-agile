import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { Plus, Mail, UserCheck, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  project_id: string;
  created_at: string;
}

interface TeamManagementProps {
  projectId: string;
  projectName: string;
  accessToken?: string;
}

export const TeamManagement = ({ projectId, projectName, accessToken }: TeamManagementProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grantJiraAccess, setGrantJiraAccess] = useState(true);
  const [grantGithubAccess, setGrantGithubAccess] = useState(true);
  const [grantTeamsAccess, setGrantTeamsAccess] = useState(true);
  
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team-members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!projectId,
  });

  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: {
      name: string;
      email: string;
      projectId: string;
      projectName: string;
      accessToken?: string;
      grantJiraAccess: boolean;
      grantGithubAccess: boolean;
      grantTeamsAccess: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("add-team-member", {
        body: memberData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", projectId] });
      toast.success("Team member added successfully! Welcome email sent.");
      setOpen(false);
      setName("");
      setEmail("");
      setGrantJiraAccess(true);
      setGrantGithubAccess(true);
      setGrantTeamsAccess(true);
    },
    onError: (error: any) => {
      toast.error(`Failed to add team member: ${error.message}`);
    },
  });

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", projectId] });
      toast.success("Team member removed successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    addMemberMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      projectId,
      projectName,
      accessToken,
      grantJiraAccess,
      grantGithubAccess,
      grantTeamsAccess,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage team members and grant access to integrations
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Add a new team member to {projectName}. They'll receive access to selected integrations and all Scrum ceremonies.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <Label className="text-base">Grant Access To:</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jira"
                      checked={grantJiraAccess}
                      onCheckedChange={(checked) => setGrantJiraAccess(checked as boolean)}
                    />
                    <label htmlFor="jira" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      JIRA Board
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="github"
                      checked={grantGithubAccess}
                      onCheckedChange={(checked) => setGrantGithubAccess(checked as boolean)}
                    />
                    <label htmlFor="github" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      GitHub Repository
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teams"
                      checked={grantTeamsAccess}
                      onCheckedChange={(checked) => setGrantTeamsAccess(checked as boolean)}
                    />
                    <label htmlFor="teams" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Microsoft Teams Channel
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMemberMutation.isPending}>
                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading team members...</div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No team members yet. Add your first team member to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium">{member.name}</span>
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  )}
                  {member.role && (
                    <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                  disabled={removeMemberMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};