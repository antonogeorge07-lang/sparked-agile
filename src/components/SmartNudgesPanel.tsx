import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info, Zap, X, RefreshCw, Bell } from "lucide-react";
import { useSmartNudges, SmartNudge } from "@/hooks/useSmartNudges";
import { formatDistanceToNow } from "date-fns";

interface SmartNudgesPanelProps {
  projectId: string | null;
}

const severityConfig = {
  urgent: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", badge: "destructive" as const },
  warning: { icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", badge: "default" as const },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30", badge: "secondary" as const },
};

export function SmartNudgesPanel({ projectId }: SmartNudgesPanelProps) {
  const { nudges, unreadCount, isGenerating, generateNudges, markAsRead, dismissNudge, loadNudges } = useSmartNudges();

  useEffect(() => {
    if (projectId) loadNudges(projectId);
  }, [projectId, loadNudges]);

  if (!projectId) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5 text-primary" />
            Smart Nudges
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{unreadCount}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateNudges(projectId)}
            disabled={isGenerating}
            className="h-8 gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-xs">Scan</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px]">
          {nudges.length > 0 ? (
            <div className="space-y-2">
              {nudges.slice(0, 8).map((nudge) => {
                const config = severityConfig[nudge.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={nudge.id}
                    className={`p-3 rounded-lg border text-sm ${config.bg} ${!nudge.is_read ? 'ring-1 ring-primary/20' : ''}`}
                    onClick={() => !nudge.is_read && markAsRead(nudge.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{nudge.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{nudge.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(nudge.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={(e) => { e.stopPropagation(); dismissNudge(nudge.id); }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No nudges right now</p>
              <p className="text-xs mt-1">Click Scan to check for issues</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
