import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  BarChart3,
  RefreshCw,
  History,
} from "lucide-react";
import { useEpicValidator, type ValidationItem } from "@/hooks/useEpicValidator";
import { StakeholderReviewPanel } from "./StakeholderReviewPanel";
import { ExecutionReadinessPanel } from "./ExecutionReadinessPanel";
import { RecalibrationLogPanel } from "./RecalibrationLogPanel";
import { ValidationWorkflowTracker } from "./ValidationWorkflowTracker";

interface EpicImplementationValidatorProps {
  epicId: string;
}

const DecisionIcon = ({ decision }: { decision: string }) => {
  switch (decision) {
    case 'implement':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'review':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'do_not_implement':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

const DecisionBadge = ({ decision }: { decision: string }) => {
  switch (decision) {
    case 'implement':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
          ✅ Implement
        </Badge>
      );
    case 'review':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
          ⚠️ Review
        </Badge>
      );
    case 'do_not_implement':
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
          ❌ Do Not Implement
        </Badge>
      );
    default:
      return <Badge variant="outline">{decision}</Badge>;
  }
};

const VerdictCard = ({ alignment, summary }: { alignment: string; summary: string }) => {
  const config: Record<string, { icon: typeof CheckCircle2; color: string; textColor: string; label: string }> = {
    aligned: {
      icon: CheckCircle2,
      color: 'border-emerald-500/30 bg-emerald-500/5',
      textColor: 'text-emerald-600',
      label: 'ALIGNED',
    },
    misaligned: {
      icon: XCircle,
      color: 'border-red-500/30 bg-red-500/5',
      textColor: 'text-red-600',
      label: 'MISALIGNED',
    },
    requires_review: {
      icon: AlertTriangle,
      color: 'border-amber-500/30 bg-amber-500/5',
      textColor: 'text-amber-600',
      label: 'REQUIRES REVIEW',
    },
  };

  const cfg = config[alignment] || {
    icon: AlertTriangle,
    color: 'border-muted',
    textColor: 'text-muted-foreground',
    label: 'UNKNOWN',
  };

  const Icon = cfg.icon;

  return (
    <div className={`rounded-lg border-2 p-6 ${cfg.color}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`h-6 w-6 ${cfg.textColor}`} />
        <span className={`text-lg font-bold ${cfg.textColor}`}>{cfg.label}</span>
      </div>
      <p className="text-sm text-muted-foreground">{summary}</p>
    </div>
  );
};

function getCurrentPhase(runStatus: string, readinessPercent: number): string {
  if (!runStatus || runStatus === 'pending_review') return 'validation';
  if (runStatus === 'stakeholder_review') return 'stakeholder_review';
  if (runStatus === 'recalibrated') return 'recalibration';
  if (runStatus === 'approved') {
    return readinessPercent < 100 ? 'readiness' : 'governance';
  }
  return 'validation';
}

export function EpicImplementationValidator({ epicId }: EpicImplementationValidatorProps) {
  const {
    isValidating,
    isLoading,
    result,
    metadata,
    validationRunId,
    runs,
    activeRun,
    validationItems,
    readinessChecks,
    recalibrationLog,
    validate,
    setItemDecision,
    updateRunStatus,
    toggleReadinessCheck,
    logRecalibration,
  } = useEpicValidator(epicId);

  const [activeTab, setActiveTab] = useState('validation');

  const handleValidate = () => validate(epicId);

  const passedChecks = readinessChecks.filter(c => c.is_passed).length;
  const readinessPercent = readinessChecks.length > 0
    ? Math.round((passedChecks / readinessChecks.length) * 100) : 0;

  const currentPhase = getCurrentPhase(
    activeRun?.status || '',
    readinessPercent
  );

  // Pre-validation state — no runs exist
  if (!isLoading && !isValidating && runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Implementation Validator</CardTitle>
              <CardDescription>
                AI-powered analysis to validate whether each feature should be implemented
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/60" />
            <h3 className="text-lg font-semibold mb-2">
              Yet to Implement — or Not to Implement?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Run AI validation to analyse all features against this Epic&apos;s strategic goals,
              dependencies, and delivery context. Results are stored and flow through
              a 5-phase governance workflow.
            </p>
            <Button onClick={handleValidate} size="lg">
              <Shield className="mr-2 h-5 w-5" />
              Run Implementation Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isValidating || isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Implementation Validator</CardTitle>
              <CardDescription>
                {isValidating ? 'Analysing epic data…' : 'Loading validation data…'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {isValidating
                ? 'Validating features against strategic goals, dependencies, and delivery context…'
                : 'Loading existing validation results…'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result || !activeRun) return null;

  const items = validationItems.length > 0 ? validationItems : result.validationItems;
  const implementCount = items.filter(i => i.decision === 'implement').length;
  const reviewCount = items.filter(i => i.decision === 'review').length;
  const removeCount = items.filter(i => i.decision === 'do_not_implement').length;

  return (
    <div className="space-y-6">
      {/* Workflow Tracker */}
      <ValidationWorkflowTracker
        currentPhase={currentPhase}
        runStatus={activeRun.status}
        readinessPercent={readinessPercent}
        recalibrationCount={recalibrationLog.length}
      />

      {/* Run History */}
      {runs.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="h-4 w-4" />
          <span>{runs.length} validation runs — showing latest from {new Date(activeRun.created_at).toLocaleDateString()}</span>
        </div>
      )}

      {/* Tabbed Workflow Phases */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="validation">AI Validation</TabsTrigger>
          <TabsTrigger value="review">Stakeholder Review</TabsTrigger>
          <TabsTrigger value="recalibration">Recalibration</TabsTrigger>
          <TabsTrigger value="readiness">Execution Readiness</TabsTrigger>
        </TabsList>

        {/* Phase 1: AI Validation Results */}
        <TabsContent value="validation" className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Validation Results</CardTitle>
                    <CardDescription>
                      {metadata?.featuresAnalysed} features • {metadata?.dependenciesChecked} dependencies
                      {metadata?.validatedAt && (
                        <> • {new Date(metadata.validatedAt).toLocaleString()}</>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleValidate}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-validate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.epicSummary}</p>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">{implementCount}</p>
                    <p className="text-sm text-muted-foreground">To Implement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold">{reviewCount}</p>
                    <p className="text-sm text-muted-foreground">Needs Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{removeCount}</p>
                    <p className="text-sm text-muted-foreground">Do Not Implement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Table */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Item</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[160px]">Decision</TableHead>
                    <TableHead>Reasoning</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DecisionIcon decision={item.decision} />
                          <span>{item.item}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DecisionBadge decision={item.decision} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                        {item.reasoning}
                      </TableCell>
                      <TableCell className="text-sm max-w-[250px]">
                        {item.recommendation}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Verdict */}
          <Card>
            <CardHeader>
              <CardTitle>Lovable Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <VerdictCard
                alignment={result.verdict.alignment}
                summary={result.verdict.summary}
              />
            </CardContent>
          </Card>

          {/* Delivery Alignment + Effort */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Delivery Alignment Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.deliveryAlignmentCheck}
                </p>
              </CardContent>
            </Card>

            {result.effortAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Effort Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.effortAnalysis.totalEstimatedPoints != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Estimated Points</span>
                        <span className="font-semibold">{result.effortAnalysis.totalEstimatedPoints}</span>
                      </div>
                    )}
                    {result.effortAnalysis.implementPoints != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Implement</span>
                        <span className="font-semibold">{result.effortAnalysis.implementPoints} pts</span>
                      </div>
                    )}
                    {result.effortAnalysis.reviewPoints != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Under Review</span>
                        <span className="font-semibold">{result.effortAnalysis.reviewPoints} pts</span>
                      </div>
                    )}
                    {result.effortAnalysis.removePoints != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Removable</span>
                        <span className="font-semibold">{result.effortAnalysis.removePoints} pts</span>
                      </div>
                    )}
                    {result.effortAnalysis.potentialSavings && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          {result.effortAnalysis.potentialSavings}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Steps */}
          {result.nextSteps && result.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actionable Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Phase 2: Stakeholder Review */}
        <TabsContent value="review">
          <StakeholderReviewPanel
            items={items}
            runStatus={activeRun.status}
            onItemDecision={setItemDecision}
            onApprove={async (notes) => {
              await updateRunStatus(activeRun.id, 'approved', notes);
            }}
            onReject={async (notes) => {
              await updateRunStatus(activeRun.id, 'rejected', notes);
            }}
            onSendForReview={async () => {
              await updateRunStatus(activeRun.id, 'stakeholder_review');
            }}
          />
        </TabsContent>

        {/* Phase 3: Recalibration */}
        <TabsContent value="recalibration">
          <RecalibrationLogPanel entries={recalibrationLog} />
        </TabsContent>

        {/* Phase 4: Execution Readiness */}
        <TabsContent value="readiness">
          <ExecutionReadinessPanel
            checks={readinessChecks}
            onToggle={toggleReadinessCheck}
            isLocked={activeRun.status === 'rejected'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
