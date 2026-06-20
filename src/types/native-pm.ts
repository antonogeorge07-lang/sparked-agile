// Native PM Ecosystem Types

export interface NativeSprint {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  velocity_committed: number;
  velocity_completed: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NativeBacklogItem {
  id: string;
  project_id: string;
  sprint_id: string | null;
  parent_id: string | null;
  epic_id: string | null;
  item_type: 'epic' | 'story' | 'task' | 'bug' | 'subtask';
  title: string;
  description: string | null;
  acceptance_criteria: string[] | null;
  status: 'open' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'closed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  story_points: number | null;
  assignee_id: string | null;
  reporter_id: string | null;
  due_date: string | null;
  position: number;
  labels: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BoardColumn {
  id: string;
  project_id: string;
  name: string;
  position: number;
  wip_limit: number | null;
  color: string | null;
  is_done_column: boolean;
  created_at: string;
}

export interface ItemComment {
  id: string;
  item_id: string;
  author_id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface AISuggestion {
  id: string;
  project_id: string;
  item_id: string | null;
  sprint_id: string | null;
  suggestion_type: 
    | 'task_assignment' 
    | 'priority_change' 
    | 'story_points' 
    | 'blocker_detection'
    | 'sprint_capacity' 
    | 'user_story_generation' 
    | 'acceptance_criteria' 
    | 'risk_prediction' 
    | 'velocity_forecast' 
    | 'workload_balance';
  title: string;
  content: string;
  confidence_score: number | null;
  status: 'pending' | 'accepted' | 'dismissed';
  metadata: Record<string, any>;
  created_at: string;
}

export interface SprintBurndown {
  id: string;
  sprint_id: string;
  snapshot_date: string;
  remaining_points: number;
  completed_points: number;
  added_points: number;
  created_at: string;
}

export interface ItemActivityLog {
  id: string;
  item_id: string;
  actor_id: string | null;
  action_type: 
    | 'created' 
    | 'updated' 
    | 'status_changed' 
    | 'assigned' 
    | 'commented'
    | 'attached' 
    | 'moved_to_sprint' 
    | 'points_changed' 
    | 'priority_changed';
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

// UI Helper Types
export type ItemTypeConfig = {
  icon: string;
  color: string;
  label: string;
};

export const ITEM_TYPE_CONFIG: Record<NativeBacklogItem['item_type'], ItemTypeConfig> = {
  epic: { icon: 'Zap', color: 'purple', label: 'Epic' },
  story: { icon: 'BookOpen', color: 'blue', label: 'Story' },
  task: { icon: 'CheckSquare', color: 'green', label: 'Task' },
  bug: { icon: 'Bug', color: 'red', label: 'Bug' },
  subtask: { icon: 'GitBranch', color: 'gray', label: 'Subtask' },
};

export const STATUS_CONFIG: Record<NativeBacklogItem['status'], { color: string; label: string }> = {
  open: { color: 'slate', label: 'Open' },
  in_progress: { color: 'blue', label: 'In Progress' },
  in_review: { color: 'amber', label: 'In Review' },
  testing: { color: 'cyan', label: 'Testing' },
  done: { color: 'emerald', label: 'Done' },
  closed: { color: 'gray', label: 'Closed' },
  blocked: { color: 'red', label: 'Blocked' },
};

export const PRIORITY_CONFIG: Record<NativeBacklogItem['priority'], { color: string; label: string }> = {
  critical: { color: 'red', label: 'Critical' },
  high: { color: 'orange', label: 'High' },
  medium: { color: 'yellow', label: 'Medium' },
  low: { color: 'green', label: 'Low' },
};

export const DEFAULT_BOARD_COLUMNS: Omit<BoardColumn, 'id' | 'project_id' | 'created_at'>[] = [
  { name: 'Backlog', position: 0, wip_limit: null, color: '#94a3b8', is_done_column: false },
  { name: 'To Do', position: 1, wip_limit: null, color: '#60a5fa', is_done_column: false },
  { name: 'In Progress', position: 2, wip_limit: 5, color: '#fbbf24', is_done_column: false },
  { name: 'In Review', position: 3, wip_limit: 3, color: '#a78bfa', is_done_column: false },
  { name: 'Done', position: 4, wip_limit: null, color: '#34d399', is_done_column: true },
];
