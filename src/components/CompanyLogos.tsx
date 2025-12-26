import { Badge } from "@/components/ui/badge";
import { GitBranch, Calendar, MessageSquare, Mail, Slack } from "lucide-react";

export const CompanyLogos = () => {
  const integrations = [
    { name: "Jira", icon: Calendar, description: "Backlog sync" },
    { name: "GitHub", icon: GitBranch, description: "Commits & PRs" },
    { name: "Teams", icon: MessageSquare, description: "Notifications" },
    { name: "Outlook", icon: Mail, description: "Calendar sync" },
    { name: "Slack", icon: Slack, description: "Team updates" }
  ];

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground font-medium">
        INTEGRATES WITH YOUR TOOLS
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center max-w-3xl mx-auto">
        {integrations.map((integration, index) => {
          const IconComponent = integration.icon;
          return (
            <div 
              key={index}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <IconComponent className="h-6 w-6 text-primary" />
              <div className="font-semibold text-sm text-center">
                {integration.name}
              </div>
              <Badge variant="secondary" className="text-xs">
                {integration.description}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
