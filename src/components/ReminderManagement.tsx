import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface Reminder {
  id: string;
  project_id: string;
  ceremony_type: string;
  scheduled_time: string;
  sent_at: string | null;
  status: string;
  reminder_message: string | null;
  created_at: string;
  projects?: {
    name: string;
  };
}

interface ReminderManagementProps {
  projectId?: string;
}

export const ReminderManagement = ({ projectId }: ReminderManagementProps) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("ceremony_reminders")
        .select(`
          *,
          projects:project_id (name)
        `)
        .order("scheduled_time", { ascending: true });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();

    // Set up realtime subscription
    const channel = supabase
      .channel("reminder_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ceremony_reminders",
          filter: projectId ? `project_id=eq.${projectId}` : undefined,
        },
        () => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("ceremony_reminders")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Reminder Deleted",
        description: "The reminder has been removed successfully",
      });

      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string, sentAt: string | null) => {
    if (sentAt) {
      return <Badge variant="outline">Sent</Badge>;
    }
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCeremonyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      standup: "Daily Standup",
      "sprint-planning": "Sprint Planning",
      "sprint-review": "Sprint Review",
      retrospective: "Retrospective",
      "backlog-refinement": "Backlog Refinement",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return <LoadingState message="Loading reminders..." />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Scheduled Reminders</CardTitle>
            <CardDescription>
              Manage your automated ceremony reminders
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchReminders}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Reminders Scheduled"
              description="Schedule your first ceremony reminder to get started"
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Ceremony</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">
                        {reminder.projects?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {getCeremonyTypeLabel(reminder.ceremony_type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(reminder.scheduled_time), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(reminder.scheduled_time), "p")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reminder.status, reminder.sent_at)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {reminder.reminder_message || "Default message"}
                      </TableCell>
                      <TableCell className="text-right">
                        {!reminder.sent_at && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reminder? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};