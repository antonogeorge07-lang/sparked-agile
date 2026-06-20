import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Zap,
  RefreshCw,
  ExternalLink,
  GitPullRequest,
  Network,
} from "lucide-react";
import { useBriefing, type BriefItem } from "@/hooks/useBriefing";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef } from "react";
import { useNotificationContext } from "@/components/NotificationProvider";

/**
 * "Here's your week" hero card. Uses generate-briefing to surface real GitHub
 * shipped / stuck / decide signals as soon as a repo is connected.
 */
export function WeeklyDigestCard() {
  const { data, loading, error, refresh } = useBriefing();
  const { notifications } = useNotificationContext();
  const notificationsReady = notifications !== undefined;
  const didFallbackRef = useRef(false);

  // Fallback: re-fetch GitHub briefing once notifications context is initialized,
  // and again shortly after mount if the first call returned no data (e.g. token
  // not yet hydrated on cold load).
  useEffect(() => {
    if (didFallbackRef.current) return;
    if (!notificationsReady) return;
    didFallbackRef.current = true;
    refresh();
  }, [notificationsReady, refresh]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data || data.status !== "ok") refresh();
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading && !data) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.status !== "ok") {
    const reason =
      data?.status === "no_token"
        ? "Reconnect GitHub so we can read your repos and build your briefing."
        : "Connect GitHub and Spark-Agile will surface what shipped, what's stuck, and what needs your call.";
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-elegant">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">
                Here's your week
              </h2>
              <p className="text-sm text-muted-foreground">{reason}</p>
              {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}
            </div>
            <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
              <Link to="/connect">
                <Zap className="h-4 w-4" />
                Connect GitHub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = new Date(data.generatedAt).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-elegant">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold">Here's your week</h2>
              <p className="text-xs text-muted-foreground truncate">
                {formattedDate}
                {data.repos.length > 0 && ` · ${data.repos.join(", ")}`}
                {data.jiraSites.length > 0 && ` · ${data.jiraSites.join(", ")}`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh briefing"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <DigestStat
            icon={<CheckCircle2 className="h-4 w-4 text-success" />}
            label="Shipped"
            value={data.shipped.count}
            helper="merged · last 7 days"
          />
          <DigestStat
            icon={<AlertCircle className="h-4 w-4 text-warning" />}
            label="Stuck"
            value={data.stuck.count}
            helper="no update · 3+ days"
          />
          <DigestStat
            icon={<HelpCircle className="h-4 w-4 text-primary" />}
            label="To decide"
            value={data.decide.count}
            helper="awaiting review"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BriefList title="Shipped" items={data.shipped.items} emptyHint="No merges yet this week." />
          <BriefList title="Stuck" items={data.stuck.items} emptyHint="Nothing stale. Nice." />
          <BriefList title="To decide" items={data.decide.items} emptyHint="No reviews waiting on the team." />
        </div>
      </CardContent>
    </Card>
  );
}

function DigestStat({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border bg-card/60 p-4">
      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{helper}</p>
    </div>
  );
}

function BriefList({
  title,
  items,
  emptyHint,
}: {
  title: string;
  items: BriefItem[];
  emptyHint: string;
}) {
  return (
    <div className="rounded-xl border bg-card/40 p-4 space-y-2 min-h-[120px]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic pt-2">{emptyHint}</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 3).map((it) => {
            const Icon = it.source === "jira" ? Network : GitPullRequest;
            return (
              <li key={`${it.source}-${it.context}-${it.key}`} className="text-sm">
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 hover:text-primary transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium">{it.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {it.key} · {it.author} ·{" "}
                      {formatDistanceToNow(new Date(it.updatedAt), { addSuffix: true })}
                    </span>
                  </span>
                  <ExternalLink className="h-3 w-3 mt-1 opacity-0 group-hover:opacity-60 shrink-0" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
