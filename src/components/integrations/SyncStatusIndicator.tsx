import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SyncStatusIndicatorProps {
  lastSyncTime: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  status: 'synced' | 'pending' | 'error' | 'stale';
  compact?: boolean;
}

export const SyncStatusIndicator = ({
  lastSyncTime,
  isRefreshing = false,
  onRefresh,
  status,
  compact = false,
}: SyncStatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle2,
          label: 'Synced',
          className: 'text-green-600 bg-green-500/10 border-green-500/20',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Syncing',
          className: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
        };
      case 'error':
        return {
          icon: AlertCircle,
          label: 'Sync Failed',
          className: 'text-red-600 bg-red-500/10 border-red-500/20',
        };
      case 'stale':
        return {
          icon: Clock,
          label: 'Stale',
          className: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formattedTime = lastSyncTime 
    ? formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })
    : 'Never';

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Icon className={cn("h-4 w-4", status === 'synced' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-muted-foreground')} />
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">Last sync: {formattedTime}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className={cn("gap-1.5", config.className)}>
        {isRefreshing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        {config.label}
      </Badge>
      
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {formattedTime}
      </div>

      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      )}
    </div>
  );
};