import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import saaiLogo from "@/assets/saai-logo.png";
import { Sparkles, Target, Users, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <BackButton fallbackPath="/" className="mb-6" />
        
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <OptimizedImage 
              src={saaiLogo} 
              alt="SAAI - Spark-Agile Active Intelligence logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="bg-gradient-primary bg-clip-text text-transparent">SAAI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Spark-Agile Active Intelligence
          </p>
        </div>

        {/* Founder Story */}
        <Card className="mb-8 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">My Story</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                At Spark-Agile, I believe agility should empower teams to do their best work. 
                I'm <strong className="text-foreground">Antono</strong>, and I created SAAI (Spark + Agile + AI) 
                to help teams unlock their full potential.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                SAAI transforms the way teams collaborate and innovate, providing clarity, focus, 
                and insights that let them make meaningful impact. It's not about managing tools; 
                it's about giving teams the space to create, deliver, and thrive.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Together with my mentor, we envision making AI-powered Agile the standard, 
                helping modern teams move with confidence, purpose, and clarity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vision & Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  Empower teams to unlock their full potential through AI-powered Agile practices
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Our Approach</h3>
                <p className="text-sm text-muted-foreground">
                  Carefully crafted solutions, not mass-market products. Every feature is designed with care
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  Make AI-powered Agile the standard for modern teams worldwide
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Micro-Studio Positioning */}
        <Card className="shadow-card bg-gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                Micro-Studio
              </Badge>
              <h2 className="text-2xl font-bold mb-4">Built with Care</h2>
              <p className="text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                SAAI is a solo-founder micro-studio project. This means every feature is thoughtfully designed, 
                every interaction carefully considered. I'm not trying to be everything to everyone—I'm focused 
                on building the best AI-powered Agile tool for teams who value quality, clarity, and purpose.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Integrations */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Trusted Integrations</h2>
          <p className="text-muted-foreground mb-6">
            SAAI seamlessly integrates with the tools your team already uses
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            <Badge variant="outline" className="text-base py-2 px-4">
              Jira
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              GitHub
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              Microsoft Teams
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              Outlook
            </Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
