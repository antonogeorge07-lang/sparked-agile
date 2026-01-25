import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Users, Lightbulb } from "lucide-react";

const philosophyPoints = [
  {
    icon: Heart,
    title: "Human First",
    description: "Built from real experience working with teams, not abstract theories. Every feature solves a problem we've actually faced."
  },
  {
    icon: Brain,
    title: "Active Intelligence",
    description: "Not artificial, but actively intelligent. Our AI learns from agile patterns to provide genuinely useful guidance, not generic responses."
  },
  {
    icon: Users,
    title: "Teams Over Tools",
    description: "Tools should serve people, not the other way around. We focus on reducing friction so you can focus on building great things."
  },
  {
    icon: Lightbulb,
    title: "Honest About Limits",
    description: "We're young in this space, but we've learned a lot. We'll always be transparent about what works and what we're still improving."
  }
];

export function OurPhilosophySection() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We believe the best tools come from understanding real challenges. 
            SAAI was built by someone who has worked alongside teams, experienced the chaos of poorly run ceremonies, 
            and seen what actually helps people do their best work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {philosophyPoints.map((point) => {
            const Icon = point.icon;
            return (
              <Card key={point.title} className="border-none shadow-sm bg-background/50 hover:bg-background/80 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground italic">
            "Every feature exists because it solved a real problem. Nothing is added just to impress."
          </p>
        </div>
      </div>
    </section>
  );
}
