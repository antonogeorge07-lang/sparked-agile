import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ScrollReveal } from "@/components/ScrollReveal";
import saaiLogo from "@/assets/saai-logo-optimized.webp";
import { 
  Sparkles, 
  Target, 
  Users, 
  Zap, 
  ArrowRight,
  Calendar,
  GitBranch,
  MessageSquare,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <BackButton fallbackPath="/" className="mb-6" />
        
        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <OptimizedImage 
                  src={saaiLogo} 
                  alt="SAAI - Spark-Agile Active Intelligence logo" 
                  className="h-28 w-auto object-contain drop-shadow-lg" 
                />
                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl -z-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="bg-gradient-primary bg-clip-text text-transparent">SAAI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              Spark-Agile Active Intelligence
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto">
              AI-powered agile tools that help teams focus on what matters most
            </p>
          </div>
        </ScrollReveal>


        {/* Founder Story */}
        <ScrollReveal delay={0.1}>
          <Card className="mb-8 shadow-card overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Our Story</h2>
                  <p className="text-sm text-muted-foreground">By Faith Invictus Studio</p>
                </div>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  At Faith Invictus Studio, we believe agility should empower teams to do their best work. 
                  We created SAAI (Spark + Agile + AI) to help teams improve their agile practices 
                  and deliver meaningful results.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  SAAI helps teams collaborate more effectively, providing clarity, focus, 
                  and insights for meaningful impact. It's not about managing tools; 
                  it's about giving teams the space to create, deliver, and thrive.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're working to make AI-powered Agile accessible to modern teams, 
                  helping them move with confidence, purpose, and clarity.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Vision & Values */}
        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Mission</h3>
                  <p className="text-sm text-muted-foreground">
                    Empower teams to unlock their full potential through AI-powered Agile practices
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Approach</h3>
                  <p className="text-sm text-muted-foreground">
                    Carefully crafted solutions, not mass-market products. Every feature is designed with care
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    Help make AI-powered Agile accessible to modern teams worldwide
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Micro-Studio Positioning */}
        <ScrollReveal delay={0.1}>
          <Card className="shadow-card bg-gradient-primary text-primary-foreground mb-10">
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  Micro-Studio
                </Badge>
                <h2 className="text-2xl font-bold mb-4">Built with Care</h2>
                <p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed mb-6">
                  SAAI is a research-driven micro-studio project by Faith Invictus Studio. Every feature is built 
                  with intention, every interaction crafted with care. We're here to create the most 
                  purposeful AI-powered Agile tools for teams that value quality, clarity, and progress.
                </p>
                <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm">
                  This is the first step toward a new era of engagement—one where AI empowers people, 
                  rather than replacing them.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Available Integrations */}
        <ScrollReveal delay={0.1}>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Available Integrations</h2>
            <p className="text-muted-foreground mb-6">
              SAAI integrates with the tools your team already uses
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="shadow-card hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.571 11.429H0v1.143h11.571zM24 11.429H12.429v1.143H24zM11.571 0H0v1.143h11.571zM24 0H12.429v1.143H24zM7.143 3.429H0v1.142h7.143zM24 3.429h-7.143v1.142H24zM4.857 6.857H0V8h4.857zM24 6.857h-4.857V8H24zM0 17.143h4.857v1.143H0zM24 17.143h-4.857v1.143H24zM0 20.571h7.143v1.143H0zM24 20.571h-7.143v1.143H24zM0 14.286h11.571v1.143H0zM24 14.286H12.429v1.143H24z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Jira</span>
                </CardContent>
              </Card>
              
              <Card className="shadow-card hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <GitBranch className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="text-sm font-medium">GitHub</span>
                </CardContent>
              </Card>
              
              <Card className="shadow-card hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Teams</span>
                </CardContent>
              </Card>
              
              <Card className="shadow-card hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Outlook</span>
                </CardContent>
              </Card>
              
              <Card className="shadow-card hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Slack</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal delay={0.15}>
          <Card className="shadow-card border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-3">Ready to Transform Your Agile Process?</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Join teams already using SAAI to streamline their ceremonies and boost productivity.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/auth">
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </main>
    </div>
  );
}
