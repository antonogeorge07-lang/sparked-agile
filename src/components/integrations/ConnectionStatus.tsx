import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "testing" | "error" | "warning";
  lastSync?: string;
  message?: string;
}

export const ConnectionStatus = ({ status, lastSync, message }: ConnectionStatusProps) => {
  const statusConfig = {
    connected: {
      icon: CheckCircle,
      label: "Connected",
      variant: "default" as const,
      className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
    },
    disconnected: {
      icon: XCircle,
      label: "Disconnected",
      variant: "secondary" as const,
      className: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30",
    },
    testing: {
      icon: Loader2,
      label: "Testing...",
      variant: "secondary" as const,
      className: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    },
    error: {
      icon: XCircle,
      label: "Connection Failed",
      variant: "destructive" as const,
      className: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
    },
    warning: {
      icon: AlertCircle,
      label: "Needs Attention",
      variant: "secondary" as const,
      className: "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <Badge variant={config.variant} className={`gap-1.5 ${config.className}`}>
        <Icon className={`h-3 w-3 ${status === 'testing' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
      {lastSync && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Last sync: {new Date(lastSync).toLocaleString()}
        </div>
      )}
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
};
