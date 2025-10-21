import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface IntegrationStatusProps {
  projectId?: string;
  hasJira: boolean;
  hasGithub: boolean;
  hasOutlook: boolean;
  jiraConfig?: any;
  githubConfig?: any;
  outlookConfig?: any;
  compact?: boolean;
}

export const IntegrationStatus = ({
  projectId,
  hasJira,
  hasGithub,
  hasOutlook,
  jiraConfig,
  githubConfig,
  outlookConfig,
  compact = false,
}: IntegrationStatusProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={hasJira ? "default" : "outline"} className="gap-1">
          {hasJira ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          JIRA {jiraConfig?.project_key && `(${jiraConfig.project_key})`}
        </Badge>
        <Badge variant={hasGithub ? "default" : "outline"} className="gap-1">
          {hasGithub ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          GitHub {githubConfig?.repo && `(${githubConfig.repo})`}
        </Badge>
        <Badge variant={hasOutlook ? "default" : "outline"} className="gap-1">
          {hasOutlook ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          Outlook
        </Badge>
        {(!hasJira || !hasGithub || !hasOutlook) && (
          <Link to="/integrations">
            <Button variant="outline" size="sm" className="gap-2">
              Setup Missing
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {hasJira ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div className="flex-1">
              <p className="font-semibold">JIRA</p>
              {hasJira && jiraConfig?.domain && (
                <p className="text-sm text-muted-foreground">
                  {jiraConfig.domain} • {jiraConfig.project_key}
                </p>
              )}
              {!hasJira && <p className="text-sm text-muted-foreground">Not connected</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {hasGithub ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div className="flex-1">
              <p className="font-semibold">GitHub</p>
              {hasGithub && githubConfig?.repo && (
                <p className="text-sm text-muted-foreground">
                  {githubConfig.owner}/{githubConfig.repo}
                </p>
              )}
              {!hasGithub && <p className="text-sm text-muted-foreground">Not connected</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {hasOutlook ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <div className="flex-1">
              <p className="font-semibold">Outlook</p>
              {hasOutlook && outlookConfig?.tenant_id && (
                <p className="text-sm text-muted-foreground">Connected</p>
              )}
              {!hasOutlook && <p className="text-sm text-muted-foreground">Not connected</p>}
            </div>
          </div>
        </div>

        {(!hasJira || !hasGithub || !hasOutlook) && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Some integrations are not configured. Set them up to unlock all features.
            </p>
            <Link to="/integrations">
              <Button variant="outline" size="sm" className="gap-2">
                Setup Integrations
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
