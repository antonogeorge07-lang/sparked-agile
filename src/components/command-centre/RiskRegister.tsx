import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Risk {
  id: string;
  risk_title: string;
  description: string | null;
  category: string;
  probability: string;
  impact: string;
  mitigation_strategy: string | null;
  owner: string | null;
  status: string;
}

interface RiskRegisterProps {
  projectId: string | null;
}

export function RiskRegister({ projectId }: RiskRegisterProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadRisks();
    }
  }, [projectId]);

  const loadRisks = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("risk_register")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error: any) {
      console.error("Error loading risks:", error);
      toast.error("Failed to load risks");
    } finally {
      setLoading(false);
    }
  };

  const getRiskSeverityColor = (probability: string, impact: string) => {
    const score = 
      (probability === "High" ? 3 : probability === "Medium" ? 2 : 1) *
      (impact === "High" ? 3 : impact === "Medium" ? 2 : 1);

    if (score >= 6) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (score >= 4) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  };

  if (!projectId) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a project to view risk register</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Risk Register</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Risk
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-2">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading risks...</p>
            </CardContent>
          </Card>
        ) : risks.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No risks identified yet</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Risk
              </Button>
            </CardContent>
          </Card>
        ) : (
          risks.map((risk) => (
            <Card key={risk.id} className="border-2 hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{risk.risk_title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                  <Badge variant="outline" className={getRiskSeverityColor(risk.probability, risk.impact)}>
                    {risk.probability} / {risk.impact}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="secondary" className="ml-2">{risk.category}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary" className="ml-2">{risk.status}</Badge>
                  </div>
                </div>

                {risk.owner && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="ml-2 font-medium">{risk.owner}</span>
                  </div>
                )}

                {risk.mitigation_strategy && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Mitigation Strategy:</p>
                    <p className="text-sm">{risk.mitigation_strategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}