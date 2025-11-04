import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
}

interface ApproveUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserApproved?: () => void;
}

export function ApproveUsersDialog({ open, onOpenChange, onUserApproved }: ApproveUsersDialogProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPendingUsers();
    }
  }, [open]);

  const loadPendingUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load pending users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingUserId(userId);
    try {
      const { error } = await supabase.rpc('approve_user', {
        user_id_param: userId
      });

      if (error) throw error;

      toast({
        title: "User Approved",
        description: "The user can now access the platform.",
      });

      await loadPendingUsers();
      onUserApproved?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setApprovingUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending User Approvals
          </DialogTitle>
          <DialogDescription>
            Review and approve users waiting for access to the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading pending users...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>No pending user approvals</p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <Card key={user.id} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{user.full_name || 'No name provided'}</span>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleApprove(user.id)}
                      disabled={approvingUserId === user.id}
                      className="gap-2"
                    >
                      {approvingUserId === user.id ? (
                        "Approving..."
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}