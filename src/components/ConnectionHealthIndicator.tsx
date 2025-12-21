import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ConnectionHealthIndicatorProps {
  connected: boolean;
  isValid: boolean;
  lastValidated: Date | null;
  error: string | null;
  isChecking: boolean;
  onValidate?: () => void;
  size?: 'sm' | 'md';
}

export const ConnectionHealthIndicator = ({
  connected,
  isValid,
  lastValidated,
  error,
  isChecking,
  onValidate,
  size = 'md',
}: ConnectionHealthIndicatorProps) => {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  if (!connected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertCircle className={cn(iconSize, "text-muted-foreground")} />
              {size === 'md' && <span className="text-sm">Not connected</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Integration not configured</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isChecking) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <RefreshCw className={cn(iconSize, "animate-spin")} />
        {size === 'md' && <span className="text-sm">Checking...</span>}
      </div>
    );
  }

  const statusColor = isValid ? 'text-green-500' : 'text-destructive';
  const StatusIcon = isValid ? CheckCircle2 : XCircle;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1", statusColor)}>
              <StatusIcon className={iconSize} />
              {size === 'md' && (
                <span className="text-sm">
                  {isValid ? 'Healthy' : 'Error'}
                </span>
              )}
            </div>
            {onValidate && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={onValidate}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">
              {isValid ? 'Connection healthy' : 'Connection error'}
            </p>
            {error && <p className="text-destructive text-xs">{error}</p>}
            {lastValidated && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Checked {formatDistanceToNow(lastValidated, { addSuffix: true })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
