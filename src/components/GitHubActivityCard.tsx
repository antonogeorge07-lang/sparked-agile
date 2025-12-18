import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GitBranch, GitCommit, GitPullRequest, AlertCircle, Settings, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface GitHubActivityCardProps {
  projectId: string | null;
}

interface GitHubActivity {
  repoName?: string;
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  }>;
  pullRequests: Array<{
    number: number;
    title: string;
    author: string;
    createdAt: string;
    url: string;
    draft: boolean;
  }>;
  issues: Array<{
    number: number;
    title: string;
    author: string;
    createdAt: string;
    url: string;
    labels: string[];
  }>;
}

export function GitHubActivityCard({ projectId }: GitHubActivityCardProps) {
  const [activity, setActivity] = useState<GitHubActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsToken, setNeedsToken] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    checkTokenAndFetch();
  }, [projectId]);

  const checkTokenAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has a token stored
      const { data: tokenData } = await supabase
        .from('user_github_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setHasToken(!!tokenData);
      await fetchActivity();
    } catch (error) {
      console.error('Error checking token:', error);
      setIsLoading(false);
    }
  };

  const fetchActivity = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-github-activity', {
        body: { projectId },
      });

      if (error) throw error;

      if (data.needsToken) {
        setNeedsToken(true);
        setActivity(null);
      } else {
        setNeedsToken(false);
        setActivity(data);
      }
    } catch (error: any) {
      console.error('Error fetching GitHub activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToken = async () => {
    if (!tokenInput.trim()) {
      toast.error("Please enter a GitHub token");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate token by making a test API call
      const testResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenInput}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!testResponse.ok) {
        throw new Error('Invalid token. Please check your Personal Access Token.');
      }

      const githubUser = await testResponse.json();

      // Save to database
      const { error } = await supabase
        .from('user_github_tokens')
        .upsert({
          user_id: user.id,
          github_token: tokenInput,
          github_username: githubUser.login,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success(`Connected as ${githubUser.login}`);
      setShowTokenDialog(false);
      setTokenInput("");
      setHasToken(true);
      await fetchActivity();
    } catch (error: any) {
      toast.error(error.message || "Failed to save token");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            GitHub Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (needsToken || (!activity?.repoName && !hasToken)) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            GitHub Activity
          </CardTitle>
          <CardDescription>Connect your GitHub to see activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <GitBranch className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">Connect your GitHub account to see commits, PRs, and issues</p>
            <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Settings className="w-4 h-4" />
                  Connect GitHub
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect GitHub</DialogTitle>
                  <DialogDescription>
                    Enter your GitHub Personal Access Token to connect your repositories.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-token">Personal Access Token</Label>
                    <Input
                      id="github-token"
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a token at{" "}
                      <a 
                        href="https://github.com/settings/tokens/new?scopes=repo" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        GitHub Settings → Developer Settings → Personal Access Tokens
                      </a>
                      {" "}with <code className="bg-muted px-1 rounded">repo</code> scope.
                    </p>
                  </div>
                  <Button onClick={saveToken} disabled={isSaving} className="w-full">
                    {isSaving ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activity?.repoName) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                GitHub Activity
              </CardTitle>
              <CardDescription>No repository connected to this project</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowTokenDialog(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Add a GitHub integration to this project to see activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              GitHub Activity
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <a 
                href={`https://github.com/${activity.repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {activity.repoName}
              </a>
              <ExternalLink className="w-3 h-3" />
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchActivity} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Commits */}
        {activity.commits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <GitCommit className="w-4 h-4" />
              Recent Commits
            </h4>
            <div className="space-y-2">
              {activity.commits.slice(0, 3).map((commit) => (
                <a
                  key={commit.sha}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <code className="text-xs text-primary font-mono">{commit.sha}</code>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{commit.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {commit.author} • {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Open PRs */}
        {activity.pullRequests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <GitPullRequest className="w-4 h-4" />
              Open Pull Requests
              <Badge variant="secondary" className="ml-auto">{activity.pullRequests.length}</Badge>
            </h4>
            <div className="space-y-2">
              {activity.pullRequests.slice(0, 3).map((pr) => (
                <a
                  key={pr.number}
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground">#{pr.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {pr.author} • {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {pr.draft && <Badge variant="outline" className="text-xs">Draft</Badge>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Open Issues */}
        {activity.issues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" />
              Open Issues
              <Badge variant="secondary" className="ml-auto">{activity.issues.length}</Badge>
            </h4>
            <div className="space-y-2">
              {activity.issues.slice(0, 3).map((issue) => (
                <a
                  key={issue.number}
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground">#{issue.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{issue.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {issue.author} • {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                        </p>
                        {issue.labels.slice(0, 2).map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {activity.commits.length === 0 && activity.pullRequests.length === 0 && activity.issues.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
