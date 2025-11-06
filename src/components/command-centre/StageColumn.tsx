import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface Task {
  id: string;
  title: string;
  description: string | null;
  owner: string | null;
  start_date: string | null;
  due_date: string | null;
  status: string;
  stage: string;
  notes: string | null;
  dependencies: string[] | null;
  progress: number;
}

interface Stage {
  id: string;
  title: string;
  color: string;
}

interface StageColumnProps {
  stage: Stage;
  tasks: Task[];
  onTaskUpdate: () => void;
}

export function StageColumn({ stage, tasks, onTaskUpdate }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`p-4 min-h-[600px] transition-all ${isOver ? "ring-2 ring-primary shadow-elevated" : ""}`}>
        <div className="mb-4">
          <div className={`h-1 w-full rounded-full bg-gradient-to-r ${stage.color} mb-3`} />
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{stage.title}</h3>
            <Badge variant="secondary" className="font-mono">
              {tasks.length}
            </Badge>
          </div>
        </div>

        <div ref={setNodeRef} className="space-y-3">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onUpdate={onTaskUpdate} />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <p>No tasks in this stage</p>
              <p className="text-xs mt-1">Drag tasks here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
