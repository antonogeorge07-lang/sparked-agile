import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";
import { RefreshCw, ExternalLink, Bug, GitBranch, GitPullRequest, GitMerge, MessageCircle, Filter, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface ActivityItem {
  id: string;
  source: 'jira' | 'github' | 'slack';
  type: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
  url: string | null;
  metadata: Record<string, any>;
}

const sourceConfig = {
  jira: { icon: Bug, label: 'Jira', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' },
  github: { icon: GitBranch, label: 'GitHub', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  slack: { icon: MessageCircle, label: 'Slack', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200' },
};

const typeIcons: Record<string, any> = {
  commit: GitBranch,
  pr_open: GitPullRequest,
  pr_merged: GitMerge,
  pr_closed: GitPullRequest,
  ticket_updated: Bug,
  message: MessageCircle,
};

export default function UnifiedActivityFeed() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sources, setSources] = useState<Record<string, boolean>>({});

  const loadProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data } = await supabase
      .from('project_members')
      .select('project_id, projects(id, name)')
      .eq('user_id', user.id);

    const list = data?.map(pm => (pm as any).projects).filter(Boolean) || [];
    setProjects(list);
    if (list.length > 0) setSelectedProject(list[0].id);
    else setIsLoading(false);
  }, []);

  const fetchFeed = useCallback(async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unified-activity-feed', {
        body: { projectId: selectedProject, limit: 50 },
      });
      if (error) throw error;
      setActivities(data?.activities || []);
      setSources(data?.sources || {});
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { if (selectedProject) fetchFeed(); }, [selectedProject, fetchFeed]);

  const filtered = filter ? activities.filter(a => a.source === filter) : activities;

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'short',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <Helmet>
          <title>Activity Feed - Spark-Agile</title>
          <meta name="description" content="View all project activity across tools in one unified feed." />
        </Helmet>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Activity className="h-7 w-7" />
                  Unified Activity Feed
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  All Jira, GitHub, and Slack activity in one stream
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {projects.length > 1 && (
                <select
                  value={selectedProject || ''}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              <Button variant="outline" size="sm" onClick={fetchFeed} disabled={isLoading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Source filters */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            {Object.entries(sourceConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = sources[key];
              return (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filter === key ? null : key)}
                  disabled={!isActive}
                  className="gap-1.5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cfg.label}
                  {isActive && (
                    <Badge variant="secondary" className="text-xs ml-1">
                      {activities.filter(a => a.source === key).length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground text-sm">
                  Connect your Jira, GitHub, or Slack integrations to see activity here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur py-1">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {items.map(item => {
                      const srcCfg = sourceConfig[item.source];
                      const TypeIcon = typeIcons[item.type] || srcCfg.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                        >
                          <div className="mt-0.5 shrink-0">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge className={`text-xs ${srcCfg.color}`}>{srcCfg.label}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="font-medium text-sm">{item.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>by {item.author}</span>
                              {item.description && <span>• {item.description}</span>}
                            </div>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
