import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface IntegrationBannerProps {
  hasJira: boolean;
  hasGithub: boolean;
  hasOutlook: boolean;
}

export const IntegrationBanner = ({ hasJira, hasGithub, hasOutlook }: IntegrationBannerProps) => {
  const missingIntegrations = [];
  if (!hasJira) missingIntegrations.push("JIRA");
  if (!hasGithub) missingIntegrations.push("GitHub");
  if (!hasOutlook) missingIntegrations.push("Outlook");

  if (missingIntegrations.length === 0) return null;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Integration Setup Required</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          To unlock full functionality, please configure: <strong>{missingIntegrations.join(", ")}</strong>
        </span>
        <Link to="/integrations">
          <Button variant="outline" size="sm" className="gap-2">
            Setup Now
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
};
