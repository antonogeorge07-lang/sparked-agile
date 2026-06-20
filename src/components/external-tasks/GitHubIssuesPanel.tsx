import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, ExternalLink, RefreshCw, Edit2, GitBranch, AlertCircle, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface GitHubIssue {
  id: number;
  title: string;
  description: string;
  status: string;
  labels: string[];
  assignee: string | null;
  url: string;
  created_at: string;
  updated_at: string;
}

interface GitHubIssuesPanelProps {
  issues: GitHubIssue[];
  isLoading: boolean;
  hasIntegration: boolean;
  error: string | null;
  onCreateIssue: (params: { title: string; body?: string; labels?: string[]; assignees?: string[] }) => Promise<any>;
  onUpdateIssue: (issueNumber: number, updates: Record<string, any>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function GitHubIssuesPanel({
  issues, isLoading, hasIntegration, error,
  onCreateIssue, onUpdateIssue, onRefresh,
}: GitHubIssuesPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', body: '', labels: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [editDialog, setEditDialog] = useState<GitHubIssue | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!hasIntegration) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">GitHub Not Connected</h3>
          <p className="text-muted-foreground text-sm">
            Connect your GitHub repository from the Dashboard → Integration Settings to manage issues here.
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
    if (!createForm.title.trim()) return;
    setIsCreating(true);
    try {
      const labels = createForm.labels.split(',').map(l => l.trim()).filter(Boolean);
      await onCreateIssue({ title: createForm.title, body: createForm.body || undefined, labels: labels.length ? labels : undefined });
      setShowCreate(false);
      setCreateForm({ title: '', body: '', labels: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create issue');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!editDialog || !editTitle.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdateIssue(editDialog.id, { title: editTitle });
      setEditDialog(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update issue');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseIssue = async (issue: GitHubIssue) => {
    try {
      await onUpdateIssue(issue.id, { state: 'closed' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to close issue');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              GitHub Issues
            </CardTitle>
            <CardDescription>{issues.length} open issues</CardDescription>
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
                  <DialogTitle>Create GitHub Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={createForm.title}
                    onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Description (Markdown supported)"
                    value={createForm.body}
                    onChange={e => setCreateForm(f => ({ ...f, body: e.target.value }))}
                    className="min-h-[120px]"
                  />
                  <Input
                    placeholder="Labels (comma-separated, e.g. bug, enhancement)"
                    value={createForm.labels}
                    onChange={e => setCreateForm(f => ({ ...f, labels: e.target.value }))}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={isCreating || !createForm.title.trim()}>
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
          <p className="text-muted-foreground text-center py-8">No open issues</p>
        ) : (
          <div className="space-y-2">
            {issues.map(issue => (
              <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <CheckCircle className="h-4 w-4 mt-1 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-xs shrink-0">#{issue.id}</Badge>
                    {issue.labels.map(label => (
                      <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
                    ))}
                  </div>
                  <p className="font-medium text-sm">{issue.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {issue.assignee && <span>→ {issue.assignee}</span>}
                    <span>Updated {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setEditDialog(issue); setEditTitle(issue.title); }}
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => handleCloseIssue(issue)}
                    title="Close issue"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                  <a href={issue.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Open on GitHub">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Issue #{editDialog?.id}</DialogTitle>
            </DialogHeader>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button onClick={handleEdit} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
