import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ControlDeckProps {
  projectId: string | null;
  tasks: any[];
}

export function ControlDeck({ projectId, tasks }: ControlDeckProps) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      loadControlData();
    }
  }, [projectId]);

  const loadControlData = async () => {
    if (!projectId) return;

    try {
      // Load milestones
      const { data: milestonesData } = await supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", projectId);
      setMilestones(milestonesData || []);

      // Load budget
      const { data: budgetData } = await supabase
        .from("project_budget")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      setBudget(budgetData);

      // Load active risks
      const { data: risksData } = await supabase
        .from("risk_register")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "Active");
      setRisks(risksData || []);
    } catch (error) {
      console.error("Error loading control data:", error);
    }
  };

  // Calculate project health (Green/Amber/Red)
  const getProjectHealth = () => {
    const completedTasks = tasks.filter(t => t.status === "Completed").length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed"
    ).length;
    
    const highRisks = risks.filter(r => r.probability === "High" || r.impact === "High").length;

    if (completionRate > 75 && overdueTasks === 0 && highRisks === 0) {
      return { status: "Green", label: "Healthy", color: "bg-emerald-500" };
    } else if (completionRate > 50 && overdueTasks < 3 && highRisks < 2) {
      return { status: "Amber", label: "At Risk", color: "bg-amber-500" };
    } else {
      return { status: "Red", label: "Critical", color: "bg-red-500" };
    }
  };

  // Calculate milestone completion
  const getMilestoneCompletion = () => {
    if (milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(m => m.status === "Completed").length;
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  // Calculate budget variance
  const getBudgetVariance = () => {
    if (!budget || budget.budget_allocated === 0) return { percent: 0, status: "on-track" };
    const variance = ((budget.budget_spent / budget.budget_allocated) * 100);
    const status = variance > 100 ? "over-budget" : variance > 90 ? "warning" : "on-track";
    return { percent: Math.round(variance), status };
  };

  // Calculate risk exposure
  const getRiskExposure = () => {
    const highRisks = risks.filter(r => r.probability === "High" && r.impact === "High").length;
    const mediumRisks = risks.filter(r => 
      (r.probability === "Medium" && r.impact === "High") ||
      (r.probability === "High" && r.impact === "Medium")
    ).length;

    if (highRisks > 2) return { level: "High", color: "text-red-500" };
    if (highRisks > 0 || mediumRisks > 3) return { level: "Medium", color: "text-amber-500" };
    return { level: "Low", color: "text-emerald-500" };
  };

  const health = getProjectHealth();
  const milestoneProgress = getMilestoneCompletion();
  const budgetVariance = getBudgetVariance();
  const riskExposure = getRiskExposure();

  return (
    <Card className="border-2 shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Control Deck
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Health Indicator */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Project Health</span>
            <Badge variant="outline" className="gap-2">
              <div className={`h-2 w-2 rounded-full ${health.color} animate-pulse`} />
              {health.label}
            </Badge>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 h-3 rounded-full ${health.status === "Green" ? health.color : "bg-muted"}`} />
            <div className={`flex-1 h-3 rounded-full ${health.status === "Amber" ? health.color : "bg-muted"}`} />
            <div className={`flex-1 h-3 rounded-full ${health.status === "Red" ? health.color : "bg-muted"}`} />
          </div>
        </div>

        {/* Milestone Completion */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Milestone Completion
            </span>
            <span className="text-sm font-mono text-accent">{milestoneProgress}%</span>
          </div>
          <Progress value={milestoneProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {milestones.filter(m => m.status === "Completed").length} of {milestones.length} milestones completed
          </p>
        </div>

        {/* Budget vs Actual */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              Budget Status
            </span>
            <Badge 
              variant={budgetVariance.status === "over-budget" ? "destructive" : "secondary"}
              className="font-mono"
            >
              {budgetVariance.percent}%
            </Badge>
          </div>
          {budget ? (
            <>
              <Progress 
                value={Math.min(budgetVariance.percent, 100)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Spent: ${budget.budget_spent?.toLocaleString() || 0}</span>
                <span>Budget: ${budget.budget_allocated?.toLocaleString() || 0}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No budget configured</p>
          )}
        </div>

        {/* Risk Exposure */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              Risk Exposure
            </span>
            <Badge variant="outline" className={riskExposure.color}>
              {riskExposure.level}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Active Risks</span>
              <span className="font-mono">{risks.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">High Priority</span>
              <span className="font-mono text-red-500">
                {risks.filter(r => r.probability === "High" && r.impact === "High").length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}