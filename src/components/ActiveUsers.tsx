import { Users, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface UserPresence {
  userId: string;
  email: string;
  name: string;
  page: string;
}

interface ActiveUsersProps {
  users: UserPresence[];
  currentPage?: string;
  variant?: 'compact' | 'full';
}

export const ActiveUsers = ({ users, currentPage, variant = 'compact' }: ActiveUsersProps) => {
  const usersOnCurrentPage = currentPage 
    ? users.filter(u => u.page === currentPage)
    : users;

  if (users.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      '/': 'Home',
      '/dashboard': 'Dashboard',
      '/workflows': 'Workflows',
      '/integrations': 'Integrations',
      '/standup': 'Standup',
      '/retrospective': 'Retrospective',
      '/planning': 'Planning',
      '/value-streams': 'Value Streams',
      '/program-increment': 'Program Increment',
      '/project-progress': 'Project Progress',
      '/flow-metrics': 'Flow Metrics',
      '/admin': 'Admin',
    };
    return labels[page] || page;
  };

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="text-sm">{users.length}</span>
          </div>
          <div className="flex -space-x-2">
            {users.slice(0, 3).map((user) => (
              <Tooltip key={user.userId}>
                <TooltipTrigger>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                    <div className="text-xs mt-1">Viewing: {getPageLabel(user.page)}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
            {users.length > 3 && (
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">+{users.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Active Users ({users.length})</h3>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.userId} className="flex items-center justify-between p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              {getPageLabel(user.page)}
            </Badge>
          </div>
        ))}
      </div>
      {currentPage && usersOnCurrentPage.length > 0 && (
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {usersOnCurrentPage.length} {usersOnCurrentPage.length === 1 ? 'user' : 'users'} viewing this page
          </div>
        </div>
      )}
    </div>
  );
};
