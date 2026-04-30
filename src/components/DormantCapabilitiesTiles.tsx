import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FlaskConical, TrendingUp, ArrowRight } from "lucide-react";

interface DormantCapabilitiesTilesProps {
  projectId: string | null;
}

const TILES = [
  {
    icon: FileText,
    title: "Meeting Notes AI",
    description: "Drop raw notes in. Get summary, decisions and action items extracted automatically.",
    cta: "Process notes",
    route: (id: string | null) => id ? `/project-command-centre?project=${id}&tab=ai-tools` : "/retrospective",
  },
  {
    icon: FlaskConical,
    title: "Test Scenarios",
    description: "Generate happy-path, edge case, security and accessibility tests from any user story.",
    cta: "Generate tests",
    route: (id: string | null) => id ? `/backlog-refinement?project=${id}` : "/backlog-refinement",
  },
  {
    icon: TrendingUp,
    title: "Resource Forecast",
    description: "Predict velocity, capacity utilisation and bottleneck risks for upcoming sprints.",
    cta: "Run forecast",
    route: (id: string | null) => id ? `/project-command-centre?project=${id}&tab=ai-tools` : "/sprint-planning-assistant",
  },
];

export function DormantCapabilitiesTiles({ projectId }: DormantCapabilitiesTilesProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TILES.map((tile) => (
        <Card key={tile.title} className="shadow-card hover-scale border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <tile.icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">{tile.title}</CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">{tile.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2"
              onClick={() => navigate(tile.route(projectId))}
            >
              {tile.cta}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
