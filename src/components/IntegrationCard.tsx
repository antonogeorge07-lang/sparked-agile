import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Github, Network, Trash2 } from "lucide-react";
import { ConnectionStatus } from "@/components/integrations/ConnectionStatus";
import { ConnectionTester } from "@/components/integrations/ConnectionTester";
import { useItemPresence } from "@/hooks/useItemPresence";
import { CollaborationIndicator } from "@/components/CollaborationIndicator";

interface IntegrationCardProps {
  integration: {
    id: string;
    name: string;
    integration_type: "jira" | "github";
    is_active: boolean;
    status: "connected" | "disconnected" | "testing" | "error" | "warning";
    lastSync?: string;
    statusMessage?: string;
    created_at: string;
    config: {
      url?: string;
      apiToken?: string;
      repository?: string;
      organization?: string;
    };
  };
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onTestComplete: (success: boolean, message: string) => void;
}

export const IntegrationCard = ({
  integration,
  onToggleActive,
  onDelete,
  onTestComplete,
}: IntegrationCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { activeUsers } = useItemPresence(
    integration.id,
    'integration',
    isEditing ? 'editing' : 'viewing'
  );

  return (
    <Card
      onMouseEnter={() => setIsEditing(false)}
      onFocus={() => setIsEditing(true)}
      onBlur={() => setIsEditing(false)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {integration.integration_type === "jira" ? (
              <Network className="w-6 h-6 text-primary" />
            ) : (
              <Github className="w-6 h-6 text-primary" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>{integration.name}</CardTitle>
                <CollaborationIndicator users={activeUsers} size="sm" />
              </div>
              <CardDescription className="capitalize">
                {integration.integration_type} Integration
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor={`active-${integration.id}`}>Active</Label>
              <Switch
                id={`active-${integration.id}`}
                checked={integration.is_active}
                onCheckedChange={() =>
                  onToggleActive(integration.id, integration.is_active)
                }
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(integration.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectionStatus
          status={integration.status}
          lastSync={integration.lastSync}
          message={integration.statusMessage}
        />
        
        <div className="text-sm text-muted-foreground space-y-1">
          {integration.integration_type === "jira" && integration.config.url && (
            <p>URL: {integration.config.url}</p>
          )}
          {integration.integration_type === "github" && (
            <>
              {integration.config.organization && (
                <p>Organization: {integration.config.organization}</p>
              )}
              {integration.config.repository && (
                <p>Repository: {integration.config.repository}</p>
              )}
            </>
          )}
          <p className="text-xs">
            Added: {new Date(integration.created_at).toLocaleDateString()}
          </p>
        </div>

        {integration.is_active && (
          <ConnectionTester
            type={integration.integration_type}
            config={integration.config}
            onTestComplete={onTestComplete}
          />
        )}
      </CardContent>
    </Card>
  );
};
