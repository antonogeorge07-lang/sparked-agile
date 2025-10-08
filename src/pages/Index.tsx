import { Navigation } from "@/components/Navigation";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, Calendar, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Daily Standup Collector",
      description: "Team members submit updates. AI generates summaries and creates tickets for impediments.",
      path: "/standup"
    },
    {
      icon: BarChart3,
      title: "Sprint Health Dashboard",
      description: "Track velocity, open impediments, and upcoming work with visual insights.",
      path: "/dashboard"
    },
    {
      icon: Calendar,
      title: "Sprint Planning Assistant",
      description: "AI suggests draft sprint plans based on backlog and team capacity.",
      path: "/planning"
    },
    {
      icon: Target,
      title: "Retrospective Generator",
      description: "Collect anonymous feedback and generate actionable themes and insights.",
      path: "/retrospective"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Your AI-Powered Scrum Master Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your agile workflow with intelligent automation. From daily standups to sprint retrospectives, let AI handle the routine so you can focus on delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => navigate("/standup")}>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features for Agile Teams</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run efficient sprints, delivered with zero setup through intelligent automation
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    onClick={() => navigate(feature.path)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 mb-16">
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
      </main>
    </div>
  );
};

export default Index;
