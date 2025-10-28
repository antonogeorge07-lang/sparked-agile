import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  ceremony_type: z.string().min(1, "Ceremony type is required"),
  scheduled_date: z.date(),
  scheduled_time: z.string().min(1, "Time is required"),
  reminder_message: z.string().optional(),
  advance_hours: z.string().optional(),
});

interface ScheduleReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export const ScheduleReminderDialog = ({
  open,
  onOpenChange,
  projects,
  onSuccess,
}: ScheduleReminderDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ceremony_type: "",
      reminder_message: "",
      advance_hours: "1",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = values.scheduled_time.split(":");
      const scheduledDateTime = new Date(values.scheduled_date);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // If advance_hours is set, subtract from scheduled time
      const advanceHours = parseInt(values.advance_hours || "0");
      if (advanceHours > 0) {
        scheduledDateTime.setHours(scheduledDateTime.getHours() - advanceHours);
      }

      const { error } = await supabase.from("ceremony_reminders").insert({
        project_id: values.project_id,
        ceremony_type: values.ceremony_type,
        scheduled_time: scheduledDateTime.toISOString(),
        reminder_message: values.reminder_message || `Reminder: ${values.ceremony_type} ceremony is scheduled soon!`,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Reminder Scheduled",
        description: `Reminder will be sent on ${format(scheduledDateTime, "PPP 'at' p")}`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Ceremony Reminder</DialogTitle>
          <DialogDescription>
            Set up an automated reminder for an upcoming ceremony
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ceremony_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ceremony Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ceremony type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standup">Daily Standup</SelectItem>
                      <SelectItem value="sprint-planning">Sprint Planning</SelectItem>
                      <SelectItem value="sprint-review">Sprint Review</SelectItem>
                      <SelectItem value="retrospective">Retrospective</SelectItem>
                      <SelectItem value="backlog-refinement">Backlog Refinement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ceremony Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ceremony Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="advance_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send Reminder (hours before)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select advance time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">At ceremony time</SelectItem>
                      <SelectItem value="1">1 hour before</SelectItem>
                      <SelectItem value="2">2 hours before</SelectItem>
                      <SelectItem value="4">4 hours before</SelectItem>
                      <SelectItem value="24">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    When should the reminder be sent?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminder_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a custom reminder message..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank for default message
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};