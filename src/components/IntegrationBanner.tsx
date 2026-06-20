import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface IntegrationBannerProps {
  hasJira: boolean;
  hasGithub: boolean;
  hasOutlook: boolean;
}

export const IntegrationBanner = ({ hasJira, hasGithub, hasOutlook }: IntegrationBannerProps) => {
  const { t } = useTranslation();
  const missingIntegrations = [];
  if (!hasJira) missingIntegrations.push("JIRA");
  if (!hasGithub) missingIntegrations.push("GitHub");
  if (!hasOutlook) missingIntegrations.push("Outlook");

  if (missingIntegrations.length === 0) return null;

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t('integrations.setupRequired')}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {t('integrations.unlockFunctionality')} <strong>{missingIntegrations.join(", ")}</strong>
        </span>
        <Link to="/integrations">
          <Button variant="outline" size="sm" className="gap-2">
            {t('integrations.setupNow')}
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
};
