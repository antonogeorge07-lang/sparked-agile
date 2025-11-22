import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Zap, Brain, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DemoChatInterface } from "./DemoChatInterface";

export function AIAssistantShowcase() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "Agile Expertise",
      description: "Deep knowledge of Scrum, Kanban, SAFe, and best practices"
    },
    {
      icon: Zap,
      title: "Instant Answers",
      description: "Get immediate help with sprint planning, ceremonies, and workflows"
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "Always ready to assist, no matter your timezone or schedule"
    },
    {
      icon: Shield,
      title: "Smart & Secure",
      description: "Powered by advanced AI with enterprise-grade security"
    }
  ];

  const exampleQuestions = [
    "How do I estimate story points effectively?",
    "What's the difference between Scrum and Kanban?",
    "Help me plan my next sprint retrospective",
    "How do I improve team velocity?"
  ];

  return (
    <section id="demo" className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden" aria-labelledby="ai-assistant-heading">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true" />
      
      <div className="container mx-auto max-w-6xl relative">
        <header className="text-center mb-12 space-y-4">
          <Badge className="gap-2" variant="secondary">
            <Sparkles className="h-3 w-3 animate-pulse" aria-hidden="true" />
            AI-Powered Assistant
          </Badge>
          <h2 id="ai-assistant-heading" className="text-4xl md:text-5xl font-bold">
            Meet Omair - Your AI Project Guide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get instant expert guidance on agile methodologies, sprint planning, and team collaboration. 
            <span className="font-semibold text-foreground"> Try it now with 3 free questions!</span>
          </p>
        </header>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
              <CardContent className="pt-6 text-center">
                <div 
                  className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto mb-4"
                  aria-hidden="true"
                >
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Demo Chat Interface */}
          <Card className="border-2 border-primary/20 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Try Omair Now</h3>
                  <p className="text-sm text-muted-foreground">No signup required • 3 free questions</p>
                </div>
              </div>

              {!isDemoOpen ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium">Quick Start Questions:</p>
                    <div className="space-y-2">
                      {exampleQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setIsDemoOpen(true)}
                          className="w-full text-left text-sm p-3 rounded-md bg-background hover:bg-primary/10 transition-colors border border-border"
                          aria-label={`Ask: ${question}`}
                        >
                          "{question}"
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsDemoOpen(true)} 
                    className="w-full gap-2"
                    size="lg"
                    aria-label="Start chatting with Omair AI assistant"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Start Free Demo
                  </Button>
                </div>
              ) : (
                <DemoChatInterface onClose={() => setIsDemoOpen(false)} />
              )}
            </CardContent>
          </Card>

          {/* Benefits & CTA */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-4">What Omair Can Help You With:</h3>
                <ul className="space-y-3" role="list">
                  <li className="flex gap-3 items-start">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Sprint Planning Guidance</p>
                      <p className="text-sm text-muted-foreground">Learn about story point estimation, velocity concepts, and capacity planning strategies</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Agile Methodology Advice</p>
                      <p className="text-sm text-muted-foreground">Get tips on standups, retrospectives, reviews, and refinement sessions</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Team Best Practices</p>
                      <p className="text-sm text-muted-foreground">Advice on collaboration, conflict resolution, and productivity improvement</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Platform Navigation</p>
                      <p className="text-sm text-muted-foreground">Help understanding SAAI features and how to use integrations</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-primary text-primary-foreground border-0">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="font-bold text-2xl">Unlock Unlimited Access</h3>
                <p className="opacity-90">
                  Connect with Omair anytime and get answers without limits.
                </p>
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="w-full"
                    aria-label="Sign up for unlimited AI assistant access"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <p className="text-sm opacity-75">Get Started Free. Go Unlimited Anytime.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
