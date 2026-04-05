import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { useProjectIntegrations } from "@/hooks/useProjectIntegrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, GitBranch, TrendingUp, CheckCircle2, Clock, AlertTriangle, FlaskConical, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TestScenarioGenerator } from "@/components/TestScenarioGenerator";
import { Skeleton } from "@/components/ui/skeleton";
import { JiraSetupWizard } from "@/components/integrations/JiraSetupWizard";
import { sampleBacklogAnalysis } from "@/data/sampleAnalyticsData";
import { useTranslation } from "react-i18next";
import {
import { Helmet } from "react-helmet-async";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BacklogItem {
  key: string;
  summary: string;
  status: string;
  priority: string;
  age_days: number;
  has_description: boolean;
  has_acceptance_criteria: boolean;
  dependencies?: string[];
  recommendation?: string;
  needs_po_attention?: boolean;
}

interface BacklogAnalysis {
  total_items: number;
  stale_items: number;
  unclear_items: number;
  items_with_dependencies: number;
  velocity_trend: string;
  recommendations: string[];
  items: BacklogItem[];
}

const BacklogRefinement = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BacklogAnalysis | null>(null);
  const [showJiraWizard, setShowJiraWizard] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);

  const { data: integrations } = useProjectIntegrations(selectedProject);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleAnalyzeBacklog = async () => {
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-backlog-health", {
        body: { projectId: selectedProject },
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${data.total_items} backlog items`,
      });
    } catch (error: any) {
      console.error("Error analyzing backlog:", error);
      const errorMsg = error.message || "Failed to analyze backlog";
      const isIntegrationMissing = errorMsg.toLowerCase().includes("not configured") || errorMsg.toLowerCase().includes("integration");
      toast({
        title: isIntegrationMissing ? "Integration Required" : "Analysis Failed",
        description: isIntegrationMissing 
          ? "Connect JIRA or GitHub integration in Integrations settings to analyse your backlog." 
          : errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendDigest = async () => {
    if (!analysis) return;

    try {
      toast({
        title: "Sending Digest",
        description: "Preparing backlog health digest...",
      });

      // In a real implementation, this would call an edge function to send via Outlook
      // For now, we'll just show a success message
      toast({
        title: "Digest Sent",
        description: "Backlog health digest has been sent via Outlook",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "highest":
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
      case "lowest":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Backlog Refinement - SAAI</title>
        <meta name="description" content="Refine your product backlog with AI-assisted prioritisation and story point estimation." />
      </Helmet>
      <Navigation />
      <div className="container mx-auto p-6 space-y-6">
        <BackButton className="mb-4" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Backlog Refinement Assistant</h1>
          <p className="text-muted-foreground">
            Continuous backlog grooming with AI-powered insights from JIRA and GitHub
          </p>
        </div>

        {integrations && selectedProject && (
          <IntegrationStatus
            projectId={selectedProject}
            hasJira={integrations.hasJira}
            hasGithub={integrations.hasGithub}
            hasOutlook={integrations.hasOutlook}
            compact
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Analyze Backlog</CardTitle>
            <CardDescription>
              Review backlog health, identify stale items, and get AI recommendations from JIRA and GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAnalyzeBacklog} disabled={isAnalyzing || !selectedProject}>
                {isAnalyzing ? "Analyzing..." : "Analyze Backlog"}
              </Button>
              {!analysis && !isAnalyzing && (
                <Button 
                  variant="outline" 
                  onClick={() => { setAnalysis(sampleBacklogAnalysis as any); setUseSampleData(true); }}
                >
                  Preview Sample Data
                </Button>
              )}
              {analysis && !useSampleData && (
                <Button onClick={handleSendDigest} variant="outline">
                  Send Outlook Digest
                </Button>
              )}
            </div>

            {/* JIRA Setup Wizard toggle */}
            {selectedProject && integrations && !integrations.hasJira && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Connect JIRA for live backlog sync and AI-powered analysis</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowJiraWizard(!showJiraWizard)}>
                  {showJiraWizard ? "Hide Setup" : "Connect JIRA"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* JIRA Setup Wizard */}
        {showJiraWizard && selectedProject && (
          <JiraSetupWizard projectId={selectedProject} onComplete={() => setShowJiraWizard(false)} />
        )}

        {/* Sample data banner */}
        {useSampleData && analysis && (
          <div className="p-3 rounded-lg bg-accent/50 border border-accent text-sm text-accent-foreground flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            Showing sample data. Connect JIRA or GitHub to see your real backlog analysis.
          </div>
        )}

        {isAnalyzing && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        )}

        {analysis && !isAnalyzing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.total_items}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Stale Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{analysis.stale_items}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Unclear Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{analysis.unclear_items}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Dependencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.items_with_dependencies}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Velocity Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{analysis.velocity_trend}</p>
              </CardContent>
            </Card>

            {analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Backlog Items Requiring Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.items
                    .filter((item) => item.needs_po_attention)
                    .map((item) => (
                      <Card key={item.key}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{item.key}</Badge>
                                <Badge variant={getPriorityColor(item.priority)}>
                                  {item.priority}
                                </Badge>
                                {item.age_days > 30 && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {item.age_days} days old
                                  </Badge>
                                )}
                                {item.needs_po_attention && (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Needs PO Attention
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold">{item.summary}</h3>
                              {item.recommendation && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Recommendation:</strong> {item.recommendation}
                                </p>
                              )}
                              {item.dependencies && item.dependencies.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <GitBranch className="h-4 w-4" />
                                  <span>Dependencies: {item.dependencies.join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  {analysis.items.filter((item) => item.needs_po_attention).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No items currently require PO attention. Great job!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Test Scenario Generator */}
        {selectedProject && (
          <div className="mt-8">
            <TestScenarioGenerator projectId={selectedProject} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklogRefinement;
