import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, Clock, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const WelcomePopup = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("welcome_popup_seen");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("welcome_popup_seen", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] animate-in slide-in-from-bottom duration-500">
        <DialogHeader>
          <div className="flex items-center justify-between mb-3">
            <Badge className="gap-2" variant="secondary">
              <Sparkles className="w-3 h-3 animate-pulse" />
              {t('welcome.badge')}
            </Badge>
          </div>
          <DialogTitle className="text-3xl font-bold">
            {t('welcome.title')}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-3">
            {t('welcome.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-2xl text-primary">{t('welcome.stat1')}</p>
              <p className="text-xs text-muted-foreground">{t('welcome.stat1Sub')}</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-2xl text-primary">{t('welcome.stat2')}</p>
              <p className="text-xs text-muted-foreground">{t('welcome.stat2Sub')}</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="font-bold text-2xl text-primary">{t('welcome.stat3')}</p>
              <p className="text-xs text-muted-foreground">{t('welcome.stat3Sub')}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{t(`welcome.feat${i}Title`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`welcome.feat${i}Desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Link to="/auth" className="flex-1" onClick={handleClose}>
            <Button className="w-full gap-2 font-semibold">
              <Rocket className="w-4 h-4" />
              {t('welcome.startFree')}
            </Button>
          </Link>
          <Button onClick={handleClose} variant="outline" className="flex-1 gap-2">
            <Sparkles className="w-4 h-4" />
            {t('welcome.exploreDemo')}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          {t('welcome.footnote')}
        </p>
      </DialogContent>
    </Dialog>
  );
};
