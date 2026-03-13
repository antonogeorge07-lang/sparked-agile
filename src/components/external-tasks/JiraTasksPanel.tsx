import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ExternalLink, RefreshCw, MessageSquare, Edit2, Bug, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface JiraIssue {
  key: string;
  summary: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  storyPoints: number;
  assignee: string | null;
  issueType: string | null;
  labels: string[];
  url: string;
}

interface JiraTasksPanelProps {
  issues: JiraIssue[];
  isLoading: boolean;
  hasIntegration: boolean;
  error: string | null;
  onCreateIssue: (params: { summary: string; description?: string; issueType?: string; priority?: string }) => Promise<any>;
  onUpdateIssue: (issueKey: string, updates: Record<string, any>) => Promise<void>;
  onAddComment: (issueKey: string, comment: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function JiraTasksPanel({
  issues, isLoading, hasIntegration, error,
  onCreateIssue, onUpdateIssue, onAddComment, onRefresh,
}: JiraTasksPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ summary: '', description: '', issueType: 'Story', priority: 'Medium' });
  const [isCreating, setIsCreating] = useState(false);
  const [commentDialog, setCommentDialog] = useState<{ key: string; summary: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [editDialog, setEditDialog] = useState<JiraIssue | null>(null);
  const [editSummary, setEditSummary] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!hasIntegration) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bug className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">Jira Not Connected</h3>
          <p className="text-muted-foreground text-sm">
            Connect your Jira board from the Dashboard → Integration Settings to manage issues here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
          <h3 className="text-lg font-medium mb-2">Connection Issue</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={onRefresh}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const handleCreate = async () => {
    if (!createForm.summary.trim()) return;
    setIsCreating(true);
    try {
      await onCreateIssue(createForm);
      setShowCreate(false);
      setCreateForm({ summary: '', description: '', issueType: 'Story', priority: 'Medium' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create issue');
    } finally {
      setIsCreating(false);
    }
  };

  const handleComment = async () => {
    if (!commentDialog || !commentText.trim()) return;
    setIsCommenting(true);
    try {
      await onAddComment(commentDialog.key, commentText);
      setCommentDialog(null);
      setCommentText('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleEdit = async () => {
    if (!editDialog || !editSummary.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdateIssue(editDialog.key, { summary: editSummary });
      setEditDialog(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update issue');
    } finally {
      setIsUpdating(false);
    }
  };

  const priorityColor = (p: string | null) => {
    switch (p?.toLowerCase()) {
      case 'highest': case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-950';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Jira Backlog
            </CardTitle>
            <CardDescription>{issues.length} issues</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> New Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Jira Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Summary"
                    value={createForm.summary}
                    onChange={e => setCreateForm(f => ({ ...f, summary: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={createForm.description}
                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={createForm.issueType} onValueChange={v => setCreateForm(f => ({ ...f, issueType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Story">Story</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Epic">Epic</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={createForm.priority} onValueChange={v => setCreateForm(f => ({ ...f, priority: v }))}>
                      <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Highest">Highest</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Lowest">Lowest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={isCreating || !createForm.summary.trim()}>
                    {isCreating ? 'Creating...' : 'Create Issue'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : issues.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No issues in backlog</p>
        ) : (
          <div className="space-y-2">
            {issues.map(issue => (
              <div key={issue.key} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs shrink-0">{issue.key}</Badge>
                    {issue.issueType && <Badge variant="secondary" className="text-xs">{issue.issueType}</Badge>}
                    {issue.priority && <Badge className={`text-xs ${priorityColor(issue.priority)}`}>{issue.priority}</Badge>}
                  </div>
                  <p className="font-medium text-sm truncate">{issue.summary}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {issue.status && <span>{issue.status}</span>}
                    {issue.assignee && <span>→ {issue.assignee}</span>}
                    {issue.storyPoints > 0 && <span>{issue.storyPoints} pts</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setEditDialog(issue); setEditSummary(issue.summary); }}
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => setCommentDialog({ key: issue.key, summary: issue.summary })}
                    title="Add comment"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                  <a href={issue.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Open in Jira">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editDialog?.key}</DialogTitle>
            </DialogHeader>
            <Input value={editSummary} onChange={e => setEditSummary(e.target.value)} placeholder="Summary" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button onClick={handleEdit} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog open={!!commentDialog} onOpenChange={open => !open && setCommentDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comment on {commentDialog?.key}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{commentDialog?.summary}</p>
            <Textarea
              placeholder="Write your comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCommentDialog(null)}>Cancel</Button>
              <Button onClick={handleComment} disabled={isCommenting || !commentText.trim()}>
                {isCommenting ? 'Posting...' : 'Post Comment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
