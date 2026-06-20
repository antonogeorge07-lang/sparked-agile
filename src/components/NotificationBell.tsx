import { Bell, AlertTriangle, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useNotificationContext } from "@/components/NotificationProvider";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotificationContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative transition-all duration-200 hover:bg-slate-800">
          <Bell className="h-5 w-5 text-slate-300" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-800 shadow-xl rounded-xl" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-slate-200 tracking-tight">System Alerts</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-sky-400 hover:text-sky-300 hover:bg-slate-800 h-7 px-2"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <ScrollArea className="h-[300px] pr-1">
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const NudgeIcon =
                    notification.severity === "urgent"
                      ? AlertTriangle
                      : notification.severity === "warning"
                        ? Zap
                        : Info;
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border text-sm transition-colors duration-150 ${
                        !notification.read
                          ? "bg-slate-800/40 border-sky-500/20 text-slate-200 shadow-sm"
                          : "bg-slate-950/20 border-slate-800/60 text-slate-400"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {notification.type === "nudge" && (
                          <NudgeIcon
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              notification.severity === "urgent"
                                ? "text-rose-500"
                                : notification.severity === "warning"
                                  ? "text-amber-500"
                                  : "text-sky-500"
                            }`}
                          />
                        )}
                        <div className="space-y-0.5">
                          <p className="font-medium leading-normal break-words">{notification.title}</p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
                No telemetry signals collected yet.
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
