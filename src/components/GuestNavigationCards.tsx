import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Calendar, BarChart3, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const navigationCards = [
  {
    title: "Sprint Planning",
    description: "AI-powered sprint planning with velocity predictions",
    icon: Target,
    path: "/sprint-planning-assistant",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Project Command Centre",
    description: "Visual project management with drag-and-drop",
    icon: Zap,
    path: "/project-command-centre",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Daily Standup",
    description: "Quick team syncs with AI-generated summaries",
    icon: Calendar,
    path: "/standup",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Analytics",
    description: "Track velocity, flow metrics, and team performance",
    icon: BarChart3,
    path: "/usage-analytics",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export const GuestNavigationCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {navigationCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.path} className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription className="text-sm">{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={card.path}>
                <Button variant="ghost" className="w-full gap-2 group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export const GuestWelcomeBanner = () => {
  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Welcome to Guest Mode!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You're exploring with sample data. Sign up to create real projects, save your work, and unlock all features.
            </p>
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                Sign Up Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
