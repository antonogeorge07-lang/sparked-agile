import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Mail, GitBranch, BarChart3, Zap, Users, Target, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CapabilityShowcase() {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const capabilities = [
    {
      icon: Mail,
      titleKey: "landing.capabilities.dailyDigest",
      descKey: "landing.capabilities.dailyDigestDesc",
      tier: "free" as const,
    },
    {
      icon: GitBranch,
      titleKey: "landing.capabilities.githubActivity",
      descKey: "landing.capabilities.githubActivityDesc",
      tier: "free" as const,
    },
    {
      icon: BarChart3,
      titleKey: "landing.capabilities.sprintHighlights",
      descKey: "landing.capabilities.sprintHighlightsDesc",
      tier: "free" as const,
    },
    {
      icon: Calendar,
      titleKey: "landing.capabilities.sprintCeremonies",
      descKey: "landing.capabilities.sprintCeremoniesDesc",
      tier: "coming-soon" as const,
    },
    {
      icon: Target,
      titleKey: "landing.capabilities.epicManagement",
      descKey: "landing.capabilities.epicManagementDesc",
      tier: "coming-soon" as const,
    },
    {
      icon: Users,
      titleKey: "landing.capabilities.teamCollaboration",
      descKey: "landing.capabilities.teamCollaborationDesc",
      tier: "coming-soon" as const,
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-muted/30 relative overflow-hidden" aria-labelledby="capabilities-heading">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--tier-free)/0.1)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,hsl(var(--muted)/0.2)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <header className="text-center mb-12">
          <h2 id="capabilities-heading" className="text-3xl md:text-4xl font-bold font-heading mb-4 opacity-0 animate-fade-in-up">
            {t('landing.capabilities.title')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto opacity-0 animate-fade-in animation-delay-200">
            {t('landing.capabilities.subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, index) => {
            const isFree = cap.tier === "free";
            const isComingSoon = cap.tier === "coming-soon";
            const isHovered = hoveredCard === index;
            
            return (
              <Card 
                key={index}
                className={`group relative p-6 cursor-pointer transition-all duration-300 overflow-hidden
                  ${isHovered ? 'scale-[1.02] shadow-elevated' : 'hover:shadow-card'}
                  ${isFree ? 'border-tier-free/20 hover:border-tier-free/40' : 'border-border hover:border-muted-foreground/30'}
                  ${isComingSoon ? 'opacity-80' : ''}
                  opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${200 + index * 80}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${isFree ? 'bg-gradient-to-br from-tier-free/5 to-transparent' : 'bg-gradient-to-br from-muted/30 to-transparent'}`} 
                />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110
                      ${isFree ? 'bg-tier-free/10 group-hover:bg-tier-free/20' : 'bg-muted group-hover:bg-muted/80'}`}>
                      <cap.icon className={`h-6 w-6 transition-transform duration-300 group-hover:rotate-[-5deg]
                        ${isFree ? 'text-tier-free' : 'text-muted-foreground'}`} />
                    </div>
                    <TierBadge tier={cap.tier} className="text-xs" />
                  </div>
                  
                  <h3 className="font-semibold font-heading text-lg mb-2 group-hover:text-foreground transition-colors">
                    {t(cap.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(cap.descKey)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 opacity-0 animate-fade-in animation-delay-700">
          <Button asChild variant="outline" className="gap-2 group">
            <Link to="/features">
              {t("landing.capabilities.seeAllFeatures")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
