import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { EditTaskDialog } from "./EditTaskDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  owner: string | null;
  due_date: string | null;
  status: string;
  stage: string;
  notes: string | null;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "In-Progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Spillover":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "Completed";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { error } = await supabase
        .from("pmi_tasks")
        .delete()
        .eq("id", task.id);

      if (error) throw error;
      toast.success("Task deleted");
      onUpdate();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`p-4 cursor-move hover:shadow-elevated transition-all border ${
          isOverdue ? "border-red-500/50" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-tight">{task.title}</h4>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEdit(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(task.status)} variant="outline">
              {task.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {task.owner && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.owner}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.due_date), "MMM dd")}</span>
              </div>
            )}
          </div>

          {task.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                {task.notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      <EditTaskDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        task={task}
        onSuccess={() => {
          onUpdate();
          setShowEdit(false);
        }}
      />
    </>
  );
}
