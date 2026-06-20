import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Target, Plus, Loader2, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationDataCard } from "@/components/IntegrationDataCard";
import { useIntegrationData } from "@/hooks/useIntegrationData";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProgramIncrement() {
  useRequireAuth();
  const [arts, setArts] = useState<any[]>([]);
  const [selectedArt, setSelectedArt] = useState<string | null>(null);
  const [pis, setPis] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPiName, setNewPiName] = useState("");
  const [newPiObjectives, setNewPiObjectives] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { jiraData, githubData, isLoading, hasJiraIntegration, hasGithubIntegration } = useIntegrationData(currentProjectId);

  useEffect(() => {
    loadArts();
  }, []);

  useEffect(() => {
    if (selectedArt) {
      loadPis();
    }
  }, [selectedArt]);

  const loadArts = async () => {
    const { data, error } = await supabase
      .from('agile_release_trains')
      .select('*, value_streams(name, project_id)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading ARTs:', error);
    } else {
      setArts(data || []);
      if (data && data.length > 0) {
        setSelectedArt(data[0].id);
        // Set current project ID for integration data
        if (data[0].value_streams) {
          setCurrentProjectId(data[0].value_streams.project_id);
        }
      }
    }
  };


  const loadPis = async () => {
    if (!selectedArt) return;

    const { data, error } = await supabase
      .from('program_increments')
      .select('*, okrs(count)')
      .eq('art_id', selectedArt)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error loading PIs:', error);
    } else {
      setPis(data || []);
    }
  };

  const createPi = async () => {
    if (!newPiName || !selectedArt || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const { error } = await supabase
      .from('program_increments')
      .insert({
        name: newPiName,
        art_id: selectedArt,
        objectives: newPiObjectives,
        start_date: startDate,
        end_date: endDate
      });

    setIsCreating(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create program increment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Program increment created successfully",
      });
      setNewPiName("");
      setNewPiObjectives("");
      setStartDate("");
      setEndDate("");
      loadPis();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Helmet>
        <title>Program Increment - Spark-Agile</title>
        <meta name="description" content="Plan and track program increments with cross-team alignment and dependency management." />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-4" />
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Program Increment Planning</h1>
              <p className="text-muted-foreground">Plan and track 8-12 week program increments</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Create Program Increment</CardTitle>
                <CardDescription>Define a new PI for coordinated delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="art">Agile Release Train</Label>
                  <select
                    id="art"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                    value={selectedArt || ""}
                    onChange={(e) => setSelectedArt(e.target.value)}
                  >
                    {arts.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.name} - {art.value_streams?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pi-name">PI Name</Label>
                  <Input
                    id="pi-name"
                    placeholder="PI 2025.1"
                    value={newPiName}
                    onChange={(e) => setNewPiName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">PI Objectives</Label>
                  <Textarea
                    id="objectives"
                    placeholder="Deliver customer portal, improve performance, reduce technical debt"
                    value={newPiObjectives}
                    onChange={(e) => setNewPiObjectives(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={createPi} 
                  disabled={isCreating}
                  className="w-full gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create PI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Program Increments</CardTitle>
                <CardDescription>Cadence-based planning cycles</CardDescription>
              </CardHeader>
              <CardContent>
                {pis.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No program increments yet. Create one to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pis.map((pi) => (
                      <div key={pi.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{pi.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            pi.status === 'active' ? 'bg-green-500/20 text-green-500' :
                            pi.status === 'planning' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {pi.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(pi.start_date).toLocaleDateString()} - {new Date(pi.end_date).toLocaleDateString()}</span>
                        </div>
                        {pi.objectives && (
                          <p className="text-sm text-muted-foreground">{pi.objectives}</p>
                        )}
                        <div className="mt-2 text-xs text-muted-foreground">
                          OKRs: {pi.okrs?.[0]?.count || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Integration Data Section */}
          {(hasJiraIntegration || hasGithubIntegration) && (
            <>
              <div className="flex items-center gap-3 mb-4 mt-8">
                <Network className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Related Integration Data</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {hasJiraIntegration && jiraData && (
                  <IntegrationDataCard type="jira" data={jiraData} isLoading={isLoading} />
                )}
                {hasGithubIntegration && githubData && (
                  <IntegrationDataCard type="github" data={{ gitPullRequests: githubData.gitPullRequests }} isLoading={isLoading} />
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}