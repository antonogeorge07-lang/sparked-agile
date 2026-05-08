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
      title: "AI-Powered Sprint Planning",
      description: "Generate sprint plans based on team velocity, backlog, and historical data"
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: "Team Collaboration",
      description: "See who's working on what with live presence indicators and updates"
    },
    {
      icon: <Calendar className="w-5 h-5 text-green-500" />,
      title: "Streamlined Ceremonies",
      description: "Smart standup summaries, retrospectives, and review coordination with Microsoft Outlook"
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-purple-500" />,
      title: "Flow Metrics & Analytics",
      description: "Track cycle time, lead time, and throughput with actionable insights"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      title: "Smart Action Items",
      description: "AI assists with extracting and tracking action items from ceremonies"
    },
    {
      icon: <Shield className="w-5 h-5 text-red-500" />,
      title: "SAFe 6.0 Support",
      description: "Full program increment planning, value streams, and ARTs management"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Experience Spark-Agile
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            See how AI helps with your agile ceremonies and workflow management
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/10 via-accent/10 to-background p-4 sm:p-8">
            <div className="relative z-10 text-center space-y-3 sm:space-y-4">
              <Badge className="mb-2" variant="outline">
                <Play className="w-3 h-3 mr-1" />
                Interactive Demo
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold">Try it yourself!</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Sign up now to access a full demo workspace with sample data. Experience AI-powered 
                sprint planning, streamlined standups, and intelligent retrospectives.
              </p>
              <Button size="lg" className="mt-3 sm:mt-4" onClick={onClose}>
                {t('demo.startFree')}
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Key Features</h3>
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
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">{feature.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Highlights */}
          <div className="p-4 sm:p-6 rounded-lg border bg-muted/30">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Available Integrations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  J
                </div>
                <p className="text-sm font-medium">Jira</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  G
                </div>
                <p className="text-sm font-medium">GitHub</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  M
                </div>
                <p className="text-sm font-medium">Microsoft 365</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  T
                </div>
                <p className="text-sm font-medium">Teams</p>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 pt-4 border-t">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Ready to improve your agile workflow?
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                Maybe Later
              </Button>
              <Button onClick={onClose} className="flex-1 sm:flex-initial">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
