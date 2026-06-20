import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useIntegrationHealth } from "@/hooks/useIntegrationHealth";

/**
 * Slim global banner that surfaces on every page whenever a connected
 * integration token is expired or revoked. Single, honest CTA: Reconnect.
 */
export function ReconnectBanner() {
  const { anyNeedsReconnect, reconnectList, isLoading } = useIntegrationHealth();

  if (isLoading || !anyNeedsReconnect) return null;

  const providers = reconnectList.map((h) => h.type).join(", ");
  const first = reconnectList[0]?.type ?? "jira";

  return (
    <div
      role="alert"
      className="border-b border-destructive/30 bg-destructive/10 text-destructive-foreground"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <span className="text-foreground">
          Your <span className="font-semibold capitalize">{providers}</span> connection needs to be re-authorised. Some features will not work until you reconnect.
        </span>
        <Link
          to={`/integrations?reconnect=${first}`}
          className="ml-auto inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Reconnect
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
