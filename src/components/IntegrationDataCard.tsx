import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, GitPullRequest, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee?: string;
  updated: string;
}

interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface GitPullRequest {
  number: number;
  title: string;
  state: string;
  author: string;
  created: string;
}

interface IntegrationDataCardProps {
  type: "jira" | "github";
  data: {
    jiraIssues?: JiraIssue[];
    gitCommits?: GitCommit[];
    gitPullRequests?: GitPullRequest[];
  };
  isLoading?: boolean;
}

export const IntegrationDataCard = ({ type, data, isLoading }: IntegrationDataCardProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (type === "jira" && data.jiraIssues) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            JIRA Issues
          </CardTitle>
          <CardDescription>Recent ticket updates from JIRA</CardDescription>
        </CardHeader>
        <CardContent>
          {data.jiraIssues.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No JIRA issues found</p>
          ) : (
            <div className="space-y-3">
              {data.jiraIssues.map((issue) => (
                <div key={issue.key} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-primary">{issue.key}</span>
                      <Badge variant={
                        issue.status === 'Done' ? 'default' :
                        issue.status === 'In Progress' ? 'secondary' :
                        'outline'
                      }>
                        {issue.status}
                      </Badge>
                    </div>
                    <Badge variant={
                      issue.priority === 'High' || issue.priority === 'Highest' ? 'destructive' :
                      issue.priority === 'Medium' ? 'default' :
                      'secondary'
                    }>
                      {issue.priority}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{issue.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {issue.assignee && <span>Assignee: {issue.assignee}</span>}
                    <span>•</span>
                    <span>Updated: {new Date(issue.updated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === "github" && (data.gitCommits || data.gitPullRequests)) {
    return (
      <>
        {data.gitCommits && data.gitCommits.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-purple-500" />
                Recent Commits
              </CardTitle>
              <CardDescription>Latest Git commits from your repository</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.gitCommits.map((commit) => (
                  <div key={commit.sha} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium">{commit.message}</p>
                      <span className="text-xs font-mono text-muted-foreground">{commit.sha.substring(0, 7)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{commit.author}</span>
                      <span>•</span>
                      <span>{new Date(commit.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.gitPullRequests && data.gitPullRequests.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-green-500" />
                Pull Requests
              </CardTitle>
              <CardDescription>Open and recent pull requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.gitPullRequests.map((pr) => (
                  <div key={pr.number} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">#{pr.number}</span>
                        {pr.state === 'open' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : pr.state === 'closed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <Badge variant={pr.state === 'open' ? 'default' : 'secondary'}>
                        {pr.state}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{pr.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{pr.author}</span>
                      <span>•</span>
                      <span>{new Date(pr.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return null;
};
