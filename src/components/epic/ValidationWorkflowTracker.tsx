import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Shield,
  Users,
  GitMerge,
  Rocket,
  BarChart3,
} from "lucide-react";

interface ValidationWorkflowPhase {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const PHASES: ValidationWorkflowPhase[] = [
  {
    key: 'validation',
    label: 'AI Validation',
    icon: Shield,
    description: 'Analyse features for strategic alignment',
  },
  {
    key: 'stakeholder_review',
    label: 'Stakeholder Review',
    icon: Users,
    description: 'Confirm or override AI recommendations',
  },
  {
    key: 'recalibration',
    label: 'Backlog Recalibration',
    icon: GitMerge,
    description: 'Archive, merge, or rescope features',
  },
  {
    key: 'readiness',
    label: 'Execution Readiness',
    icon: Rocket,
    description: 'Verify DoR, dependencies, and environment',
  },
  {
    key: 'governance',
    label: 'Governance',
    icon: BarChart3,
    description: 'Monitor drift and continuous alignment',
  },
];

interface ValidationWorkflowTrackerProps {
  currentPhase: string;
  runStatus: string;
  readinessPercent: number;
  recalibrationCount: number;
}

function getPhaseStatus(
  phaseKey: string,
  currentPhase: string,
  runStatus: string,
  readinessPercent: number,
  recalibrationCount: number
): 'completed' | 'active' | 'pending' {
  const phaseOrder = ['validation', 'stakeholder_review', 'recalibration', 'readiness', 'governance'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const phaseIndex = phaseOrder.indexOf(phaseKey);

  if (phaseIndex < currentIndex) return 'completed';
  if (phaseIndex === currentIndex) return 'active';
  
  // Special cases
  if (phaseKey === 'validation' && runStatus !== 'pending_review') return 'completed';
  if (phaseKey === 'stakeholder_review' && (runStatus === 'approved' || runStatus === 'recalibrated')) return 'completed';
  if (phaseKey === 'recalibration' && recalibrationCount > 0 && runStatus === 'recalibrated') return 'completed';
  if (phaseKey === 'readiness' && readinessPercent === 100) return 'completed';

  return 'pending';
}

export function ValidationWorkflowTracker({
  currentPhase,
  runStatus,
  readinessPercent,
  recalibrationCount,
}: ValidationWorkflowTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Validation Workflow</CardTitle>
        <CardDescription>
          Track progress through the 5-phase validation lifecycle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PHASES.map((phase, index) => {
            const status = getPhaseStatus(
              phase.key,
              currentPhase,
              runStatus,
              readinessPercent,
              recalibrationCount
            );
            const Icon = phase.icon;

            return (
              <div key={phase.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border min-w-[140px] transition-colors ${
                    status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : status === 'active'
                      ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : status === 'active' ? (
                      <div className="relative">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${
                      status === 'completed' ? 'text-emerald-600' :
                      status === 'active' ? 'text-primary' :
                      'text-muted-foreground'
                    }`}>
                      {phase.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {phase.description}
                    </p>
                  </div>
                </div>
                {index < PHASES.length - 1 && (
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 ${
                    status === 'completed' ? 'text-emerald-500' : 'text-muted-foreground/40'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
