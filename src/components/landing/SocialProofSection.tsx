import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Star, Zap } from "lucide-react";

export const SocialProofSection = () => {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Agile Teams",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      value: "30%",
      label: "Velocity Increase",
      color: "text-green-500"
    },
    {
      icon: Star,
      value: "4.8/5",
      label: "User Rating",
      color: "text-yellow-500"
    },
    {
      icon: Zap,
      value: "5 hrs",
      label: "Saved per Sprint",
      color: "text-purple-500"
    }
  ];

  return (
    <section className="py-12 px-4 bg-muted/30" aria-label="Social proof and statistics">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center space-y-2">
                  <Icon className={`h-8 w-8 mx-auto ${stat.color}`} aria-hidden="true" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-2">
            ✓ GDPR Compliant
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ Enterprise Security
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ 99.9% Uptime
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ 24/7 Support
          </Badge>
        </div>
      </div>
    </section>
  );
};