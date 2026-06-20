import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Filter, AlertCircle, Clock, Blocks } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface Task {
  id: string;
  status: string;
  stage: string;
  due_date: string | null;
}

interface CommandPanelProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectChange: (projectId: string) => void;
  tasks: Task[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const PMI_STAGES = ["initiation", "planning", "execution", "monitoring", "closure"];

export function CommandPanel({
  projects,
  selectedProject,
  onProjectChange,
  tasks,
  activeFilter,
  onFilterChange,
}: CommandPanelProps) {
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getTasksByStage = (stage: string) => tasks.filter(t => t.stage === stage).length;

  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed"
  ).length;

  const blockedTasks = tasks.filter(t => t.status === "Spillover").length;

  const upcomingTasks = tasks.filter(t => {
    if (!t.due_date || t.status === "Completed") return false;
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date(t.due_date) <= weekFromNow;
  }).length;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blocks className="h-5 w-5 text-primary" />
          Command Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Active Project</label>
          <Select value={selectedProject || ""} onValueChange={onProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{completedTasks} completed</span>
            <span>{totalTasks} total</span>
          </div>
        </div>

        {/* Tasks per Stage */}
        <div>
          <h4 className="text-sm font-medium mb-3">Tasks by Stage</h4>
          <div className="space-y-2">
            {PMI_STAGES.map(stage => {
              const count = getTasksByStage(stage);
              return (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-xs capitalize">{stage}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Quick Filters
          </h4>
          <div className="space-y-2">
            <Button
              variant={activeFilter === "overdue" ? "default" : "outline"}
              size="sm"
              className="w-full justify-between"
              onClick={() => onFilterChange(activeFilter === "overdue" ? null : "overdue")}
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Overdue
              </span>
              <Badge variant="destructive">{overdueTasks}</Badge>
            </Button>

            <Button
              variant={activeFilter === "blocked" ? "default" : "outline"}
              size="sm"
              className="w-full justify-between"
              onClick={() => onFilterChange(activeFilter === "blocked" ? null : "blocked")}
            >
              <span className="flex items-center gap-2">
                <Blocks className="h-4 w-4" />
                Blocked
              </span>
              <Badge variant="secondary">{blockedTasks}</Badge>
            </Button>

            <Button
              variant={activeFilter === "upcoming" ? "default" : "outline"}
              size="sm"
              className="w-full justify-between"
              onClick={() => onFilterChange(activeFilter === "upcoming" ? null : "upcoming")}
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming (7d)
              </span>
              <Badge variant="secondary">{upcomingTasks}</Badge>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
