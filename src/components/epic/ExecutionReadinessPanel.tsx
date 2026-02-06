import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Server,
  Database,
  Globe,
  Settings,
  Users,
  CheckCircle2,
} from "lucide-react";
import type { ReadinessCheck } from "@/hooks/useEpicValidator";

interface ExecutionReadinessPanelProps {
  checks: ReadinessCheck[];
  onToggle: (checkId: string, isPassed: boolean) => Promise<void>;
  isLocked: boolean;
}

const CHECK_ICONS: Record<string, React.ElementType> = {
  dor_compliance: Shield,
  technical_dependency: Settings,
  environment_ready: Server,
  api_ready: Globe,
  data_ready: Database,
  devops_ready: Settings,
  stakeholder_signoff: Users,
};

const CHECK_COLORS: Record<string, string> = {
  dor_compliance: 'text-blue-500',
  technical_dependency: 'text-purple-500',
  environment_ready: 'text-emerald-500',
  api_ready: 'text-amber-500',
  data_ready: 'text-cyan-500',
  devops_ready: 'text-orange-500',
  stakeholder_signoff: 'text-primary',
};

export function ExecutionReadinessPanel({
  checks,
  onToggle,
  isLocked,
}: ExecutionReadinessPanelProps) {
  const passedCount = checks.filter(c => c.is_passed).length;
  const totalCount = checks.length;
  const progressPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const isReady = passedCount === totalCount && totalCount > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Execution Readiness</CardTitle>
              <CardDescription>
                Verify all prerequisites before moving to implementation
              </CardDescription>
            </div>
          </div>
          <Badge variant={isReady ? 'default' : 'secondary'}>
            {isReady ? 'READY' : `${passedCount}/${totalCount}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Readiness Progress</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {checks.map((check) => {
            const Icon = CHECK_ICONS[check.check_type] || Shield;
            const iconColor = CHECK_COLORS[check.check_type] || 'text-muted-foreground';

            return (
              <div
                key={check.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                  check.is_passed
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <Checkbox
                  checked={check.is_passed}
                  onCheckedChange={(checked) => onToggle(check.id, !!checked)}
                  disabled={isLocked}
                />
                <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${check.is_passed ? 'line-through text-muted-foreground' : ''}`}>
                    {check.check_name}
                  </p>
                  {check.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{check.notes}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    check.is_passed
                      ? 'border-emerald-500/30 text-emerald-600'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {check.check_type.replace('_', ' ')}
                </Badge>
              </div>
            );
          })}
        </div>

        {isReady && (
          <div className="rounded-lg border-2 border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-emerald-600">
              All readiness checks passed — Epic is ready for Sprint/PI commitment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
