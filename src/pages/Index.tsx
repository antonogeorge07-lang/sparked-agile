import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureCard } from "@/components/FeatureCard";
import { ArrowRight, GitBranch, Target, TrendingUp, Calendar, Users, BarChart3, Video, Zap, Bot, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { OnboardingTour } from "@/components/OnboardingTour";
import { DemoModal } from "@/components/DemoModal";
import { DemoModeButton } from "@/components/DemoModeButton";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { GuestModeBar } from "@/components/GuestModeBar";
import { useGuestMode } from "@/hooks/useGuestMode";
import { WelcomePopup } from "@/components/WelcomePopup";

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { isGuestMode, enableGuestMode } = useGuestMode();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const animatedFeatures = [
    {
      icon: Zap,
      title: "AI-Powered Automation",
      description: "Automate standups, retrospectives, and planning with intelligent AI assistance"
    },
    {
      icon: Bot,
      title: "Smart Insights",
      description: "Get actionable insights from your sprint data and team performance metrics"
    },
    {
      icon: CheckCircle2,
      title: "SAFe 6.0 Aligned",
      description: "Built on proven frameworks to scale agile across your entire organization"
    }
  ];

  const safeFeatures = [
    {
      icon: GitBranch,
      title: "Value Streams",
      description: "Manage your value streams and align teams around delivering customer value",
      path: "/value-streams"
    },
    {
      icon: Calendar,
      title: "Program Increments",
      description: "Plan and track your PI objectives with AI-powered planning assistance",
      path: "/program-increment"
    },
    {
      icon: TrendingUp,
      title: "Flow Metrics",
      description: "Monitor throughput, WIP, and cycle time to optimize your delivery flow",
      path: "/flow-metrics"
    },
    {
      icon: Target,
      title: "Retrospectives",
      description: "Conduct effective sprint retrospectives with AI-generated insights",
      path: "/retrospective"
    },
    {
      icon: Users,
      title: "Daily Standups",
      description: "Streamline your daily standups with automated summaries and action items",
      path: "/standup"
    },
    {
      icon: BarChart3,
      title: "Workflows",
      description: "Automate your agile ceremonies and integrate with your existing tools",
      path: "/workflows"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <WelcomePopup />
      <Navigation />
      
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
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="safe">Plan with SAFe 6.0</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <section className="py-8 md:py-16">
              <div className="max-w-4xl mx-auto text-center animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                  Your AI-Powered Scrum Master
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Streamline your agile workflow with intelligent automation powered by SAFe 6.0. From daily standups to program increments, let AI handle the routine so you can focus on delivering value.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <DemoModeButton />
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => setShowDemoModal(true)}
                  >
                    <Video className="w-4 h-4" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </section>

            {/* Animated Features Section */}
            <section className="py-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">See SM ActiveIntelligence in Action</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Discover how our platform streamlines your entire agile workflow with AI-powered automation
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {animatedFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card 
                        key={index}
                        className={`p-6 transition-all duration-500 ${
                          activeFeature === index 
                            ? 'scale-105 shadow-elevated border-primary bg-primary/5' 
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

            {/* CTA Section */}
            <section className="py-8 mb-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-elevated">
                  <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                    Ready to Transform Your Sprint Process?
                  </h2>
                  <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                    Join teams using AI to automate their agile ceremonies and focus on what matters most - delivering value.
                  </p>
                  <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate("/standup")}>
                    Start Your First Standup
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="safe" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Plan with SAFe 6.0
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Leverage the full power of Scaled Agile Framework with AI-powered tools for enterprise-scale agile delivery
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {safeFeatures.map((feature, index) => (
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
