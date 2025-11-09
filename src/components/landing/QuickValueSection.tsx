import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickValueSection = () => {
  const benefits = [
    "Set up your first project in under 2 minutes",
    "AI generates sprint plans automatically from your backlog",
    "Sync with JIRA, GitHub & Microsoft 365 instantly",
    "Get actionable insights from your retrospectives",
    "Save 5+ hours per sprint on ceremony preparation",
    "Real-time collaboration with your entire team"
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30" aria-label="Quick value proposition">
      <div className="container mx-auto max-w-5xl">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-3">
                    Why Teams Choose SAAI
                  </h2>
                  <p className="text-muted-foreground">
                    Everything you need to run agile at scale, powered by AI
                  </p>
                </div>
                
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button size="lg" className="w-full md:w-auto gap-2 group">
                    Start Free - No Credit Card
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary mb-2">2 minutes</div>
                    <p className="text-sm text-muted-foreground">From signup to your first AI-generated sprint plan</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-green-500 mb-2">30%</div>
                    <p className="text-sm text-muted-foreground">Average increase in team velocity within first month</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-blue-500 mb-2">5+ hours</div>
                    <p className="text-sm text-muted-foreground">Saved per sprint on ceremony prep and admin work</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};