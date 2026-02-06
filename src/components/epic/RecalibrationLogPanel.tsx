import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GitMerge,
  Archive,
  ArrowUpDown,
  Scissors,
  Link2,
  Map,
} from "lucide-react";
import type { RecalibrationEntry } from "@/hooks/useEpicValidator";

interface RecalibrationLogPanelProps {
  entries: RecalibrationEntry[];
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  archived: Archive,
  merged: GitMerge,
  reordered: ArrowUpDown,
  rescoped: Scissors,
  dependency_updated: Link2,
  roadmap_updated: Map,
};

const ACTION_COLORS: Record<string, string> = {
  archived: 'text-muted-foreground bg-muted/50',
  merged: 'text-blue-600 bg-blue-500/10',
  reordered: 'text-purple-600 bg-purple-500/10',
  rescoped: 'text-amber-600 bg-amber-500/10',
  dependency_updated: 'text-cyan-600 bg-cyan-500/10',
  roadmap_updated: 'text-emerald-600 bg-emerald-500/10',
};

export function RecalibrationLogPanel({ entries }: RecalibrationLogPanelProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GitMerge className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Recalibration Log</CardTitle>
              <CardDescription>
                No recalibration actions taken yet
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Recalibration actions (archive, merge, reorder, rescope) will appear here
            once stakeholder decisions are finalised.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GitMerge className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Recalibration Log</CardTitle>
            <CardDescription>
              {entries.length} action{entries.length !== 1 ? 's' : ''} taken to realign backlog
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const Icon = ACTION_ICONS[entry.action_type] || GitMerge;
            const colorClass = ACTION_COLORS[entry.action_type] || 'text-muted-foreground bg-muted/50';

            return (
              <div key={entry.id}>
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.action_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{entry.description}</p>
                  </div>
                </div>
                {index < entries.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
