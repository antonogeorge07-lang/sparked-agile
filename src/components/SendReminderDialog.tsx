import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function SendReminderDialog({ open, onOpenChange, projectId, projectName }: SendReminderDialogProps) {
  const [ceremonyType, setCeremonyType] = useState<string>("standup");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const ceremonyOptions = [
    { value: "standup", label: "Daily Standup", emoji: "🗣️" },
    { value: "retrospective", label: "Sprint Retrospective", emoji: "🔄" },
    { value: "sprint_planning", label: "Sprint Planning", emoji: "📋" },
    { value: "sprint_review", label: "Sprint Review", emoji: "🎯" },
    { value: "backlog_refinement", label: "Backlog Refinement", emoji: "🔍" },
  ];

  const handleSend = async () => {
    if (!ceremonyType) {
      toast.error("Please select a ceremony type");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-reminder', {
        body: {
          projectId,
          ceremonyType,
          message: message.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || "Reminders sent successfully!");
        onOpenChange(false);
        setMessage("");
        setCeremonyType("standup");
      } else {
        toast.error(data?.message || "Failed to send reminders");
      }
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast.error(error.message || "Failed to send reminders");
    } finally {
      setLoading(false);
    }
  };

  const selectedCeremony = ceremonyOptions.find(c => c.value === ceremonyType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Send Ceremony Reminder
          </DialogTitle>
          <DialogDescription>
            Send an email reminder to all team members for {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ceremony-type">Ceremony Type</Label>
            <Select value={ceremonyType} onValueChange={setCeremonyType}>
              <SelectTrigger id="ceremony-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ceremonyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any additional information for the team..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {selectedCeremony && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Preview:</strong> Team members will receive a {selectedCeremony.emoji} {selectedCeremony.label} reminder email
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Reminders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}