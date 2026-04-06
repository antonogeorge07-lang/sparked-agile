import { Navigation } from "@/components/Navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureCard } from "@/components/FeatureCard";
import { ArrowRight, GitBranch, Target, Calendar, Users, BarChart3, Zap, Bot, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { OnboardingTour } from "@/components/OnboardingTour";
import { DemoModal } from "@/components/DemoModal";
import { DemoModeButton } from "@/components/DemoModeButton";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { GuestModeBar } from "@/components/GuestModeBar";
import { useGuestMode } from "@/hooks/useGuestMode";
import { WelcomePopup } from "@/components/WelcomePopup";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { isGuestMode, enableGuestMode } = useGuestMode();
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    checkAuthAndOnboarding();
  }, []);

  const checkAuthAndOnboarding = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Authenticated users get redirected to dashboard
      navigate("/dashboard", { replace: true });
      return;
    } else {
      // For non-authenticated users, show the old tour
      const hasSeenOnboarding = localStorage.getItem("onboarding_completed");
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const animatedFeatures = [
    {
      icon: Zap,
      title: "AI-Powered Sprint Planning",
      description: "Automate sprint planning with intelligent backlog analysis and team capacity insights"
    },
    {
      icon: Bot,
      title: "Smart Retrospectives",
      description: "Get AI-generated insights from your retros to continuously improve team performance"
    },
    {
      icon: CheckCircle2,
      title: "Integrated Workflows",
      description: "Connect JIRA, GitHub, and Microsoft 365 to streamline your entire agile workflow"
    }
  ];

  const coreFeatures = [
    {
      icon: GitBranch,
      title: "Epic Management",
      description: "Track and manage epics with dependency mapping and progress visualization",
      path: "/epic-management"
    },
    {
      icon: Calendar,
      title: "Sprint Planning",
      description: "AI-assisted sprint planning with automatic story point estimation",
      path: "/sprint-planning-assistant"
    },
    {
      icon: Target,
      title: "Retrospectives",
      description: "Conduct effective retrospectives with AI-generated insights and action items",
      path: "/retrospective"
    },
    {
      icon: Users,
      title: "Daily Standups",
      description: "Streamline daily standups with automated summaries and blocker tracking",
      path: "/standup"
    },
    {
      icon: BarChart3,
      title: "Workflows & Analytics",
      description: "Automate ceremonies and track team performance with real-time metrics",
      path: "/workflows"
    },
    {
      icon: Target,
      title: "Project Command Centre",
      description: "Centralized view of all your projects, tasks, and team collaboration",
      path: "/project-command-centre"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>SAAI - Your AI-Powered Scrum Master</title>
        <meta name="description" content="Streamline your agile workflow with intelligent automation for standups, sprint planning, and retrospectives." />
      </Helmet>
      <WelcomePopup />
      <Navigation />
      
      {/* Old onboarding tour for non-authenticated users */}
      <OnboardingTour 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
      
      <EmailCaptureForm
        isOpen={showEmailCapture} 
        onClose={() => setShowEmailCapture(false)}
        context="newsletter"
      />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-1 mb-4 sm:mb-8">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Platform Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <section className="py-4 sm:py-8 md:py-16">
              <div className="max-w-4xl mx-auto text-center animate-fade-in px-3 sm:px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-primary bg-clip-text text-transparent">
                  Your AI-Powered Scrum Master
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Streamline your agile workflow with intelligent automation. From daily standups to sprint planning, let AI handle the routine so you can focus on delivering value.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <DemoModeButton />
                </div>
              </div>
            </section>

            {/* Animated Features Section */}
            <section className="py-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Agile Tools</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Everything your team needs for effective agile project management
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {animatedFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card 
                        key={index}
                      className={`p-4 sm:p-6 transition-all duration-500 ${
                          activeFeature === index 
                            ? 'sm:scale-105 shadow-elevated border-primary bg-primary/5' 
                            : 'hover:scale-102'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`p-4 rounded-full transition-all duration-500 ${
                            activeFeature === index 
                              ? 'bg-primary text-primary-foreground animate-pulse' 
                              : 'bg-muted'
                          }`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-semibold">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-2">
                  {animatedFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeFeature === index 
                          ? 'w-8 bg-primary' 
                          : 'w-2 bg-muted-foreground/30'
                      }`}
                      aria-label={`Go to feature ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* All Features Grid */}
            <section className="py-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Agile Toolkit</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    From epics to standups, manage your entire agile workflow in one place
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {coreFeatures.map((feature, index) => (
                    <FeatureCard
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      onClick={() => navigate(feature.path)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-8 mb-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-primary rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-elevated">
                  <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                    Ready to Transform Your Agile Process?
                  </h2>
                  <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                    Join teams using AI to streamline their agile ceremonies and focus on what matters most - delivering value.
                  </p>
                  <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate("/sprint-planning-assistant")}>
                    Start Sprint Planning
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="safe" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Explore All Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive tools for small to medium-sized agile teams
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {coreFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  onClick={() => navigate(feature.path)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {isGuestMode && <GuestModeBar onTryDemo={() => setShowDemoModal(true)} />}
    </div>
  );
};

export default Index;
