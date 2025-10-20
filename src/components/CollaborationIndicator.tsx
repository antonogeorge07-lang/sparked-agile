import { Eye, Edit3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserItemPresence {
  userId: string;
  email: string;
  name: string;
  action: 'viewing' | 'editing';
}

interface CollaborationIndicatorProps {
  users: UserItemPresence[];
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CollaborationIndicator = ({ 
  users, 
  className,
  showLabels = false,
  size = 'sm'
}: CollaborationIndicatorProps) => {
  if (users.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const editingUsers = users.filter(u => u.action === 'editing');
  const viewingUsers = users.filter(u => u.action === 'viewing');

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Editing users - show with edit icon */}
        {editingUsers.length > 0 && (
          <div className="flex items-center gap-1">
            {showLabels && (
              <Badge variant="default" className="gap-1 animate-pulse">
                <Edit3 className="h-3 w-3" />
                Editing
              </Badge>
            )}
            <div className="flex -space-x-2">
              {editingUsers.slice(0, 3).map((user) => (
                <Tooltip key={user.userId}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className={cn(
                        sizeClasses[size],
                        "border-2 border-background ring-2 ring-orange-500"
                      )}>
                        <AvatarFallback className="bg-orange-500 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                        <Edit3 className="h-2.5 w-2.5 text-orange-500" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" />
                        {user.name}
                      </div>
                      <div className="text-muted-foreground">{user.email}</div>
                      <div className="text-xs mt-1 text-orange-500">Currently editing</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {editingUsers.length > 3 && (
                <div className={cn(
                  sizeClasses[size],
                  "rounded-full border-2 border-background bg-orange-500 text-white flex items-center justify-center font-medium"
                )}>
                  +{editingUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Viewing users - show with eye icon */}
        {viewingUsers.length > 0 && (
          <div className="flex items-center gap-1">
            {showLabels && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                Viewing
              </Badge>
            )}
            <div className="flex -space-x-2">
              {viewingUsers.slice(0, 3).map((user) => (
                <Tooltip key={user.userId}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className={cn(
                        sizeClasses[size],
                        "border-2 border-background"
                      )}>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                        <Eye className="h-2.5 w-2.5 text-primary" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-semibold flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {user.name}
                      </div>
                      <div className="text-muted-foreground">{user.email}</div>
                      <div className="text-xs mt-1">Currently viewing</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {viewingUsers.length > 3 && (
                <div className={cn(
                  sizeClasses[size],
                  "rounded-full border-2 border-background bg-muted flex items-center justify-center font-medium"
                )}>
                  +{viewingUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
