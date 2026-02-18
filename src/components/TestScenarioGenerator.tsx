import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTestScenarios, TestScenario } from "@/hooks/useTestScenarios";
import { FlaskConical, Loader2, CheckCircle2, AlertTriangle, Shield, Accessibility } from "lucide-react";

interface TestScenarioGeneratorProps {
  projectId: string | null;
  backlogItemId?: string;
  initialStory?: string;
  initialCriteria?: string;
}

const typeIcons: Record<string, any> = {
  happy_path: CheckCircle2,
  edge_case: AlertTriangle,
  negative: AlertTriangle,
  security: Shield,
  accessibility: Accessibility,
  performance: FlaskConical,
};

const typeColors: Record<string, string> = {
  happy_path: "bg-green-500/10 text-green-700",
  edge_case: "bg-orange-500/10 text-orange-700",
  negative: "bg-destructive/10 text-destructive",
  security: "bg-purple-500/10 text-purple-700",
  accessibility: "bg-blue-500/10 text-blue-700",
  performance: "bg-cyan-500/10 text-cyan-700",
};

const priorityBadge: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function TestScenarioGenerator({ projectId, backlogItemId, initialStory = "", initialCriteria = "" }: TestScenarioGeneratorProps) {
  const { isGenerating, scenarios, generate } = useTestScenarios();
  const [userStory, setUserStory] = useState(initialStory);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(initialCriteria);

  const handleGenerate = () => {
    if (!projectId || !userStory) return;
    generate({ projectId, userStory, acceptanceCriteria, backlogItemId });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            AI Test Scenario Generator
          </CardTitle>
          <CardDescription>
            Generate acceptance test cases from user stories and acceptance criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>User Story</Label>
            <Textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder="As a [user], I want to [action] so that [benefit]..."
              className="min-h-[100px]"
            />
          </div>
          <div>
            <Label>Acceptance Criteria (optional)</Label>
            <Textarea
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="Given... When... Then..."
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating || !userStory || !projectId} className="w-full">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Scenarios...</>
            ) : (
              <><FlaskConical className="mr-2 h-4 w-4" />Generate Test Scenarios</>
            )}
          </Button>
        </CardContent>
      </Card>

      {scenarios.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated Scenarios ({scenarios.length})</CardTitle>
              <div className="flex gap-1">
                {Object.entries(
                  scenarios.reduce((acc, s) => { acc[s.type] = (acc[s.type] || 0) + 1; return acc; }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">{type.replace('_', ' ')}: {count}</Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[500px]">
              <Accordion type="single" collapsible className="space-y-2">
                {scenarios.map((scenario, i) => {
                  const Icon = typeIcons[scenario.type] || FlaskConical;
                  return (
                    <AccordionItem key={i} value={`scenario-${i}`} className="border rounded-lg px-3">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-2 text-left">
                          <div className={`p-1 rounded ${typeColors[scenario.type] || 'bg-muted'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium">{scenario.title}</span>
                          <Badge variant={priorityBadge[scenario.priority]} className="text-xs ml-auto mr-2">
                            {scenario.priority}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pb-4">
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        {scenario.preconditions && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Preconditions</p>
                            <p className="text-sm bg-muted/50 p-2 rounded">{scenario.preconditions}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Steps</p>
                          <ol className="space-y-1 list-decimal list-inside">
                            {scenario.steps.map((step, si) => (
                              <li key={si} className="text-sm">{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Expected Result</p>
                          <div className="flex items-start gap-2 p-2 bg-green-500/5 rounded border border-green-500/20">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <p className="text-sm">{scenario.expected_result}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
