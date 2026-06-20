import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Target, Users, Zap, ArrowRight, Sparkles } from "lucide-react";

interface AgentDebateShowcaseProps {
  projectId: string | null;
}

const AGENTS = [
  { icon: Target, label: "Strategist" },
  { icon: Shield, label: "Risk Analyst" },
  { icon: Zap, label: "Quality Guardian" },
  { icon: Users, label: "User Advocate" },
];

export function AgentDebateShowcase({ projectId }: AgentDebateShowcaseProps) {
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (projectId) {
      navigate(`/project-command-centre?project=${projectId}&tab=agents`);
    } else {
      navigate("/project-command-centre");
    }
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-elegant">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Multi-Agent Debate
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Signature
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                AI agents with opposing perspectives debate, critique and reach consensus on your sprint plan, epics and risks.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AGENTS.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-2 p-2 rounded-md bg-card/60 border border-border/40"
            >
              <a.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium truncate">{a.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button onClick={handleLaunch} className="gap-2 flex-1 sm:flex-none">
            Launch a debate
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground self-center">
            5 debate types: Sprint, Backlog, Risk, Epic, Retro
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
