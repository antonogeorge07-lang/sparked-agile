import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw, GitPullRequest, GitMerge, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GitHubPR {
  number: number;
  title: string;
  body: string;
  state: string;
  draft: boolean;
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  url: string;
  head: string;
  base: string;
  labels: string[];
  reviewers: string[];
}

interface GitHubPRsPanelProps {
  pullRequests: GitHubPR[];
  isLoading: boolean;
  hasIntegration: boolean;
  onRefresh: () => Promise<void>;
}

export function GitHubPRsPanel({ pullRequests, isLoading, hasIntegration, onRefresh }: GitHubPRsPanelProps) {
  if (!hasIntegration) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GitPullRequest className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">GitHub Not Connected</h3>
          <p className="text-muted-foreground text-sm">
            Connect your GitHub repository to view and manage pull requests.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusIcon = (pr: GitHubPR) => {
    if (pr.mergedAt) return <GitMerge className="h-4 w-4 text-purple-500" />;
    if (pr.draft) return <Clock className="h-4 w-4 text-muted-foreground" />;
    return <GitPullRequest className="h-4 w-4 text-green-500" />;
  };

  const statusLabel = (pr: GitHubPR) => {
    if (pr.mergedAt) return 'Merged';
    if (pr.draft) return 'Draft';
    if (pr.state === 'closed') return 'Closed';
    return 'Open';
  };

  const statusColor = (pr: GitHubPR) => {
    if (pr.mergedAt) return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200';
    if (pr.draft) return 'bg-muted text-muted-foreground';
    if (pr.state === 'closed') return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
    return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              Pull Requests
            </CardTitle>
            <CardDescription>{pullRequests.length} pull requests</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : pullRequests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No pull requests found</p>
        ) : (
          <div className="space-y-2">
            {pullRequests.map(pr => (
              <div key={pr.number} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="mt-0.5 shrink-0">{statusIcon(pr)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-xs shrink-0">#{pr.number}</Badge>
                    <Badge className={`text-xs ${statusColor(pr)}`}>{statusLabel(pr)}</Badge>
                    {pr.labels.map(label => (
                      <Badge key={label} variant="secondary" className="text-xs">{label}</Badge>
                    ))}
                  </div>
                  <p className="font-medium text-sm">{pr.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{pr.head} → {pr.base}</span>
                    <span>by {pr.author}</span>
                    <span>Updated {formatDistanceToNow(new Date(pr.updatedAt), { addSuffix: true })}</span>
                  </div>
                  {pr.reviewers.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                      <span>Reviewers:</span>
                      {pr.reviewers.map(r => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <a href={pr.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Open on GitHub">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
