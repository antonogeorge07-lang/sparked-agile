import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StakeholderInviteFormProps {
  projectId: string | null;
}

export function StakeholderInviteForm({ projectId }: StakeholderInviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!projectId) {
      toast.error("Please select a project first");
      return;
    }

    setSending(true);
    try {
      // Send invite notification via edge function
      const { error } = await supabase.functions.invoke("send-approval-notification", {
        body: {
          type: "stakeholder_invite",
          email: email.trim(),
          projectId,
          role,
        },
      });

      if (error) throw error;

      setSentEmails((prev) => [...prev, email.trim()]);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Invite Stakeholders
        </CardTitle>
        <CardDescription>
          Invite external stakeholders to view project insights, approve requests, and receive digests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="stakeholder-email">Email Address</Label>
            <Input
              id="stakeholder-email"
              type="email"
              placeholder="stakeholder@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <div className="w-full sm:w-40 space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="approver">Approver</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleInvite}
              disabled={sending || !email.trim() || !projectId}
              className="gap-2 w-full sm:w-auto"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Invite
            </Button>
          </div>
        </div>

        {sentEmails.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Recently invited:</p>
            <div className="flex flex-wrap gap-2">
              {sentEmails.map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
