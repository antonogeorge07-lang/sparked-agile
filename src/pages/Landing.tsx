import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Target, Zap, Users, Shield, ArrowRight, Star, Quote } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DemoModal } from "@/components/DemoModal";
import { DemoModeButton } from "@/components/DemoModeButton";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { TrustBadges } from "@/components/TrustBadges";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Landing() {
  const { trackButtonClick } = useAnalytics();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailContext, setEmailContext] = useState<"early_access" | "newsletter" | "beta" | "exit_intent">("newsletter");
  const navigate = useNavigate();

  // Exit intent detection
  useEffect(() => {
    let exitIntentShown = false;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        setEmailContext("exit_intent");
        setShowEmailCapture(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  useEffect(() => {
    // Redirect authenticated users
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const hasCompletedWorkspace = localStorage.getItem("workspace_setup_completed");
        navigate(hasCompletedWorkspace ? "/dashboard" : "/project-workspace");
      }
    };
    checkAuth();
  }, [navigate]);
  
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Sprint Planning",
      description: "Automatically generate sprint plans from JIRA backlog with velocity-based estimates",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Backlog Refinement",
      description: "AI analyzes backlog health, identifies stale items, and recommends improvements",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Automated Retrospectives",
      description: "Collect feedback anonymously and generate actionable insights with AI",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Real-time presence, activity tracking, and seamless team coordination",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Row-level security, role-based access control, and encrypted data storage",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "JIRA & GitHub Integration",
      description: "Seamless integration with your existing tools and workflows",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Scrum Master, TechCorp",
      content: "SM ActiveIntelligence transformed our sprint planning. What used to take 3 hours now takes 30 minutes, and the AI recommendations are spot-on.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Engineering Manager, StartupXYZ",
      content: "The backlog refinement feature alone is worth it. We've reduced stale tickets by 80% and improved our velocity by 25%.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Product Owner, Enterprise Inc",
      content: "Finally, a tool that understands agile workflows. The JIRA integration works flawlessly, and the AI insights are incredibly valuable.",
      rating: 5,
    },
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and small teams",
      features: [
        "Up to 5 team members",
        "1 workspace",
        "Basic AI features",
        "JIRA & GitHub integration",
        "Community support",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "per user/month",
      description: "For growing teams and businesses",
      features: [
        "Unlimited team members",
        "5 workspaces",
        "Advanced AI features",
        "All integrations",
        "Priority support",
        "Usage analytics",
        "Custom workflows",
      ],
      cta: "Start Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Unlimited workspaces",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "Advanced security",
        "Training & onboarding",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-base sm:text-xl">SM ActiveIntelligence</span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                  by Antono George
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/auth" className="hidden sm:block">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => trackButtonClick('Sign In', 'nav')}
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="sm"
                  onClick={() => trackButtonClick('Get Started', 'nav')}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col items-center gap-3 mb-2">
              <Badge className="gap-2" variant="secondary">
                <Sparkles className="h-3 w-3 animate-pulse" />
                AI-Powered Scrum Master Assistant
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold px-4">
              Transform Your
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Agile Workflow
              </span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Automate sprint planning, backlog refinement, and retrospectives with AI.
              Integrated with JIRA, GitHub, and Outlook.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => trackButtonClick('Start Free Trial', 'hero')}
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <DemoModeButton />
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => {
                  trackButtonClick('Watch Demo', 'hero');
                  setIsDemoOpen(true);
                }}
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setEmailContext("early_access");
                  setShowEmailCapture(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                🎁 Get early access to beta features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <TrustBadges />
        </div>
      </section>


      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Modern Agile Teams
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Whether you're running sprints, managing stakeholders, or driving project success, 
              SM ActiveIntelligence adapts to your workflow and amplifies your impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* For Scrum Masters */}
            <Card className="border-2 hover:shadow-elegant transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Scrum Masters</CardTitle>
                <CardDescription className="text-base">
                  Orchestrate ceremonies with confidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Automate standup summaries and track blockers in real-time
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Generate sprint plans from JIRA with AI-powered velocity analysis
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Run productive retrospectives with anonymous feedback and AI insights
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Schedule and coordinate all ceremonies with Outlook integration
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* For Project Managers */}
            <Card className="border-2 hover:shadow-elegant transition-all border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">For Project Managers</CardTitle>
                <CardDescription className="text-base">
                  Drive projects to successful completion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Monitor project health with flow metrics and burndown charts
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Identify risks early with AI-powered backlog analysis
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Track team velocity and predictability across multiple sprints
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Generate executive-ready reports with one click
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* For Stakeholders */}
            <Card className="border-2 hover:shadow-elegant transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Stakeholders</CardTitle>
                <CardDescription className="text-base">
                  Stay informed without the noise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Access real-time dashboards showing project progress and milestones
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Review sprint outcomes and team achievements at a glance
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Get automated summaries and insights without attending every meeting
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Make data-driven decisions with AI-generated recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">85%</p>
              <p className="text-sm text-muted-foreground">Less time in ceremonies</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">3x</p>
              <p className="text-sm text-muted-foreground">Faster sprint planning</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">40%</p>
              <p className="text-sm text-muted-foreground">Velocity improvement</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">100%</p>
              <p className="text-sm text-muted-foreground">Team satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Agile Excellence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your agile ceremonies and boost team productivity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your team
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${tier.popular ? "border-primary border-2 shadow-lg" : ""}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">/{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Scrum Masters Worldwide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what our customers are saying about SM ActiveIntelligence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-muted-foreground mb-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{testimonial.content}</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-primary text-primary-foreground border-0">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Agile Workflow?
              </h2>
              <p className="text-lg opacity-90">
                Join thousands of teams already using SM ActiveIntelligence
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">SM ActiveIntelligence</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered Scrum Master assistant for agile teams
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <p className="text-muted-foreground">
                © 2025 SM ActiveIntelligence. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-medium">
                  Crafted with excellence by{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold">
                    Antono George
                  </span>
                </span>
                <Badge variant="secondary" className="ml-2 gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Product Manager
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <EmailCaptureForm 
        isOpen={showEmailCapture} 
        onClose={() => setShowEmailCapture(false)}
        context={emailContext}
      />
    </div>
  );
}
