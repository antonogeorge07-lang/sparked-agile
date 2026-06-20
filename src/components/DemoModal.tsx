import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, Zap, Users, Calendar, BarChart3, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      titleKey: "demo.feature1Title",
      descKey: "demo.feature1Desc"
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      titleKey: "demo.feature2Title",
      descKey: "demo.feature2Desc"
    },
    {
      icon: <Calendar className="w-5 h-5 text-green-500" />,
      titleKey: "demo.feature3Title",
      descKey: "demo.feature3Desc"
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
      titleKey: "demo.feature4Title",
      descKey: "demo.feature4Desc"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      titleKey: "demo.feature5Title",
      descKey: "demo.feature5Desc"
    },
    {
      icon: <Shield className="w-5 h-5 text-red-500" />,
      titleKey: "demo.feature6Title",
      descKey: "demo.feature6Desc"
    }
  ];

  const integrations = [
    { key: "demo.integrationJira", letter: "J" },
    { key: "demo.integrationGitHub", letter: "G" },
    { key: "demo.integrationMicrosoft365", letter: "M" },
    { key: "demo.integrationTeams", letter: "T" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('demo.title')}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {t('demo.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 via-accent/10 to-background p-4 sm:p-8">
            <div className="relative z-10 text-center space-y-3 sm:space-y-4">
              <Badge className="mb-2" variant="outline">
                <Play className="w-3 h-3 mr-1" />
                {t('demo.interactiveBadge')}
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold">{t('demo.tryYourself')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                {t('demo.signUpPrompt')}
              </p>
              <Button size="lg" className="mt-3 sm:mt-4" onClick={onClose}>
                {t('demo.startFree')}
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('demo.keyFeatures')}</h3>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">{t(feature.titleKey)}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(feature.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Highlights */}
          <div className="p-4 sm:p-6 rounded-lg border bg-muted/30">
            <h3 className="text-base sm:text-lg font-semibold mb-3">{t('demo.availableIntegrations')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {integrations.map((integration) => (
                <div key={integration.key} className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {integration.letter}
                  </div>
                  <p className="text-sm font-medium">{t(integration.key)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 pt-4 border-t">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {t('demo.readyToImprove')}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                {t('demo.maybeLater')}
              </Button>
              <Button onClick={onClose} className="flex-1 sm:flex-initial">
                {t('demo.getStartedFree')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
