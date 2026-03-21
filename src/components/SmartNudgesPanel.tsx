import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Info, Zap, X, RefreshCw, Sparkles, TrendingUp, Users, Gauge, ShieldCheck, Calendar, Workflow, ArrowRight } from "lucide-react";
import { useSmartNudges, SmartNudge } from "@/hooks/useSmartNudges";
import { formatDistanceToNow } from "date-fns";

interface SmartNudgesPanelProps {
  projectId: string | null;
}

const severityConfig = {
  urgent: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", badge: "destructive" as const },
  warning: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", badge: "default" as const },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10 border-primary/20", badge: "secondary" as const },
};

const categoryConfig: Record<string, { icon: typeof TrendingUp; label: string }> = {
  process: { icon: Workflow, label: "Process" },
  velocity: { icon: TrendingUp, label: "Velocity" },
  collaboration: { icon: Users, label: "Collaboration" },
  capacity: { icon: Gauge, label: "Capacity" },
  quality: { icon: ShieldCheck, label: "Quality" },
  ceremony: { icon: Calendar, label: "Ceremony" },
};

function NudgeCard({ nudge, onDismiss, onRead }: { nudge: SmartNudge; onDismiss: () => void; onRead: () => void }) {
  const config = severityConfig[nudge.severity] || severityConfig.info;
  const Icon = config.icon;
  const catConfig = categoryConfig[nudge.category] || categoryConfig.process;
  const CatIcon = catConfig.icon;

  return (
    <div
      className={`p-3.5 rounded-xl border text-sm transition-all cursor-pointer hover:shadow-sm ${config.bg} ${!nudge.is_read ? 'ring-1 ring-primary/30' : 'opacity-80'}`}
      onClick={() => !nudge.is_read && onRead()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">{nudge.title}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 font-normal">
                <CatIcon className="w-2.5 h-2.5" />
                {catConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">{nudge.message}</p>
            {nudge.suggested_action && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-0.5">
                <ArrowRight className="w-3 h-3" />
                <span>{nudge.suggested_action}</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground/60">
              {formatDistanceToNow(new Date(nudge.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 shrink-0 opacity-50 hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function SmartNudgesPanel({ projectId }: SmartNudgesPanelProps) {
  const { nudges, unreadCount, isGenerating, aiPowered, generateNudges, markAsRead, dismissNudge, loadNudges } = useSmartNudges();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (projectId) loadNudges(projectId);
  }, [projectId, loadNudges]);

  if (!projectId) return null;

  const categories = ["all", ...new Set(nudges.map(n => n.category || "process"))];
  const filteredNudges = activeTab === "all" ? nudges : nudges.filter(n => (n.category || "process") === activeTab);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Team Insights
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{unreadCount}</Badge>
            )}
            {aiPowered && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-primary border-primary/30">AI</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateNudges(projectId)}
            disabled={isGenerating}
            className="h-8 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-xs">{isGenerating ? 'Analysing…' : 'Analyse'}</span>
          </Button>
        </div>
        {nudges.length > 0 && categories.length > 2 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="h-7 p-0.5">
              {categories.map(cat => {
                const config = categoryConfig[cat];
                const count = cat === "all" ? nudges.length : nudges.filter(n => (n.category || "process") === cat).length;
                return (
                  <TabsTrigger key={cat} value={cat} className="text-[11px] h-6 px-2 gap-1">
                    {cat === "all" ? "All" : config?.label || cat}
                    <span className="text-muted-foreground">({count})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          {filteredNudges.length > 0 ? (
            <div className="space-y-2.5">
              {filteredNudges.slice(0, 10).map((nudge) => (
                <NudgeCard
                  key={nudge.id}
                  nudge={nudge}
                  onDismiss={() => dismissNudge(nudge.id)}
                  onRead={() => markAsRead(nudge.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="font-medium">All clear for now</p>
              <p className="text-xs mt-1 max-w-[200px] mx-auto">Click Analyse to scan your team's patterns and get contextual suggestions</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
