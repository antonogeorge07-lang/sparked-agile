import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const PrivacyBanner = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAcknowledged = localStorage.getItem("privacy_banner_acknowledged");
    if (!hasAcknowledged) {
      // Show after a short delay
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("privacy_banner_acknowledged", "true");
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Show again next session if not accepted
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[50] border-2 border-primary/20 bg-card/95 backdrop-blur-sm shadow-elevated">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm">{t('privacy.banner.title')}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 -mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('privacy.banner.description')} {" "}
              <Link to="/privacy" className="text-primary hover:underline">
                {t('privacy.banner.learnMore')}
              </Link>
            </p>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAccept} size="sm" className="text-xs">
                {t('privacy.banner.accept')}
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {t('privacy.banner.maybeLater')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
