import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { WorkspaceChat } from "@/components/team-hub/WorkspaceChat";
import { TaskComments } from "@/components/team-hub/TaskComments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, MessageSquare, Users } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

interface BacklogItem {
  id: string;
  title: string;
  status: string;
  item_type: string;
}

export default function TeamHub() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const { t } = useTranslation();
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('native_backlog_items')
        .select('id, title, status, item_type')
        .order('updated_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      setBacklogItems(data || []);
    } catch {
      // silent fail
    } finally {
      setLoadingItems(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Helmet>
          <title>Team Hub - SAAI</title>
          <meta name="description" content="Collaborate with your team through workspace chat, task comments, and shared dashboards." />
        </Helmet>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Team Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Communicate with your team and discuss tasks, all in one place.
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Team Chat
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Task Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            {wsLoading ? (
              <Skeleton className="h-[600px] w-full" />
            ) : (
              <WorkspaceChat
                workspaceId={workspace?.id || null}
                workspaceName={workspace?.name}
              />
            )}
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Item selector */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Select a Task</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {loadingItems ? (
                      <div className="space-y-2 p-4">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : backlogItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8 px-4">
                        No backlog items found. Create tasks in Command Centre first.
                      </p>
                    ) : (
                      <div className="space-y-0.5 p-2">
                        {backlogItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${
                              selectedItem?.id === item.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="truncate flex-1">{item.title}</span>
                              <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                                {item.item_type}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Comments panel */}
              <div className="lg:col-span-2">
                {selectedItem ? (
                  <TaskComments itemId={selectedItem.id} itemTitle={selectedItem.title} />
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                      <p className="text-muted-foreground text-sm">
                        Select a task from the left to view or add comments.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
