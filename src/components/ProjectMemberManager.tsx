import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
  profiles: Profile;
}

interface ProjectMemberManagerProps {
  projectId: string;
  projectName: string;
}

export function ProjectMemberManager({ projectId, projectName }: ProjectMemberManagerProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
    loadAvailableUsers();
  }, [projectId]);

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id,
        user_id,
        role,
        profiles:user_id (id, email, full_name)
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading members:', error);
      toast({
        title: "Error",
        description: "Failed to load project members",
        variant: "destructive",
      });
    } else {
      setMembers(data || []);
    }
    setIsLoading(false);
  };

  const loadAvailableUsers = async () => {
    // Get all approved users - RLS restricts to own profile + teammates
    const { data: approvedUsers, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('role', ['admin', 'member']);

    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    // Filter out users already in project
    const memberIds = members.map(m => m.user_id);
    const available = (approvedUsers || []).filter(user => !memberIds.includes(user.id));
    setAvailableUsers(available);
  };

  const addMember = async (userId: string) => {
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role: 'member'
      });

    if (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member to project",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Member added to project",
      });
      loadMembers();
      loadAvailableUsers();
      setShowAddMember(false);
    }
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Member removed from project",
      });
      loadMembers();
      loadAvailableUsers();
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading members...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Project Members</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage who can access {projectName}
            </p>
          </div>
          <Button
            onClick={() => setShowAddMember(!showAddMember)}
            size="sm"
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddMember && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Add Team Member</h4>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available users to add</p>
            ) : (
              <div className="space-y-2">
                {availableUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button size="sm" onClick={() => addMember(user.id)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-muted-foreground text-sm">No members yet</p>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{member.profiles.full_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMember(member.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
