import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, MessageSquare, Users, Zap, CheckCircle2, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PolyLinQ = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Real-Time Translation",
      description: "Messages are instantly translated as team members chat, ensuring seamless communication across language barriers."
    },
    {
      icon: Globe,
      title: "Support for 100+ Languages",
      description: "Connect with team members worldwide with comprehensive language support for global collaboration."
    },
    {
      icon: Users,
      title: "Team Language Preferences",
      description: "Each team member sets their preferred language, and PolyLinQ handles the rest automatically."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Translations happen in milliseconds, maintaining the natural flow of conversation without delays."
    }
  ];

  const useCases = [
    {
      title: "Distributed Teams",
      description: "Enable seamless collaboration across offices in different countries without language becoming a barrier.",
      icon: Users
    },
    {
      title: "Customer-Facing Projects",
      description: "Communicate directly with international clients in their preferred language while your team works in theirs.",
      icon: MessageSquare
    },
    {
      title: "Global DevOps",
      description: "Coordinate deployments, incidents, and updates across time zones and languages effortlessly.",
      icon: Globe
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-5xl mx-auto text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              <Languages className="w-4 h-4 mr-2" />
              Part of SAAI
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Built for Teams That Speak Every Language
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Collaborate with global teams. Message in your language, read in theirs.
            </p>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              PolyLinQ automatically translates messages in real-time, enabling teams to communicate naturally in their native languages while everyone receives messages in theirs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => navigate("/integrations")}>
                Enable PolyLinQ
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Demo Placeholder */}
        <section className="py-12 max-w-5xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20 shadow-elevated">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  Live translation demo coming soon
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  See how PolyLinQ enables seamless communication across languages in real-time
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="py-12 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Translation Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to break down language barriers and enable global collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-12 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect For Every Global Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From distributed development teams to customer support, PolyLinQ adapts to your workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card key={index} className="text-center shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    <CardDescription className="text-left">{useCase.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Integration Badge */}
        <section className="py-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-primary text-primary-foreground shadow-elevated">
            <CardContent className="p-8 md:p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Seamlessly Works with SAAI
              </h3>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                PolyLinQ integrates directly into your existing workspace. Enable it with one click and start collaborating across languages immediately.
              </p>
              <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate("/integrations")}>
                Enable PolyLinQ Inside Your Workspace
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="py-12 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { step: "1", title: "Set Your Language", description: "Each team member chooses their preferred language in settings" },
              { step: "2", title: "Chat Naturally", description: "Write messages in your own language without thinking about translation" },
              { step: "3", title: "Receive Translated", description: "Messages appear in your language automatically, with option to view original" }
            ].map((item, index) => (
              <Card key={index} className="p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Break Language Barriers?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Enable PolyLinQ today and start collaborating with your global team seamlessly.
            </p>
            <Button size="lg" className="gap-2" onClick={() => navigate("/integrations")}>
              Get Started with PolyLinQ
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PolyLinQ;
