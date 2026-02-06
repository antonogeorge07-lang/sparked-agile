import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Users,
  Save,
} from "lucide-react";
import type { ValidationItem } from "@/hooks/useEpicValidator";

interface StakeholderReviewPanelProps {
  items: ValidationItem[];
  runStatus: string;
  onItemDecision: (
    itemId: string,
    decision: 'implement' | 'review' | 'do_not_implement' | 'merged' | 'archived',
    notes?: string
  ) => Promise<void>;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (notes?: string) => Promise<void>;
  onSendForReview: () => Promise<void>;
}

const DECISION_OPTIONS = [
  { value: 'implement', label: '✅ Implement', color: 'text-emerald-600' },
  { value: 'review', label: '⚠️ Review', color: 'text-amber-600' },
  { value: 'do_not_implement', label: '❌ Remove', color: 'text-red-600' },
  { value: 'merged', label: '🔗 Merge', color: 'text-blue-600' },
  { value: 'archived', label: '📦 Archive', color: 'text-muted-foreground' },
];

const DecisionIcon = ({ decision }: { decision: string }) => {
  switch (decision) {
    case 'implement': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'review': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'do_not_implement': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'merged': return <span className="text-blue-500">🔗</span>;
    case 'archived': return <span className="text-muted-foreground">📦</span>;
    default: return null;
  }
};

export function StakeholderReviewPanel({
  items,
  runStatus,
  onItemDecision,
  onApprove,
  onReject,
  onSendForReview,
}: StakeholderReviewPanelProps) {
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [approvalNotes, setApprovalNotes] = useState('');
  const [savingItem, setSavingItem] = useState<string | null>(null);

  const decidedCount = items.filter(i => i.finalDecision).length;
  const allDecided = items.length > 0 && decidedCount === items.length;

  const handleSaveDecision = async (itemId: string, decision: string) => {
    setSavingItem(itemId);
    await onItemDecision(
      itemId,
      decision as any,
      itemNotes[itemId]
    );
    setSavingItem(null);
  };

  const isReviewable = runStatus === 'pending_review' || runStatus === 'stakeholder_review';

  return (
    <div className="space-y-6">
      {/* Status & Actions Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Stakeholder Review</CardTitle>
                <CardDescription>
                  Review AI recommendations and confirm or override each decision
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                runStatus === 'approved' ? 'default' :
                runStatus === 'rejected' ? 'destructive' :
                'secondary'
              }>
                {runStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {decidedCount} of {items.length} items reviewed
            </p>
            <div className="flex gap-2">
              {runStatus === 'pending_review' && (
                <Button variant="outline" onClick={onSendForReview}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send for Stakeholder Review
                </Button>
              )}
              {isReviewable && allDecided && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onReject(approvalNotes)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApprove(approvalNotes)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve & Lock Scope
                  </Button>
                </>
              )}
            </div>
          </div>
          {isReviewable && allDecided && (
            <Textarea
              className="mt-4"
              placeholder="Optional review notes..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={2}
            />
          )}
        </CardContent>
      </Card>

      {/* Review Table */}
      <Card>
        <CardHeader>
          <CardTitle>Item-by-Item Review</CardTitle>
          <CardDescription>
            Override AI decisions or add stakeholder context for each feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Feature</TableHead>
                <TableHead className="w-[120px]">AI Decision</TableHead>
                <TableHead className="w-[160px]">Your Decision</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {item.reasoning}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <DecisionIcon decision={item.decision} />
                      <span className="text-xs capitalize">
                        {item.decision.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isReviewable ? (
                      <Select
                        value={item.finalDecision || item.decision}
                        onValueChange={(val) => handleSaveDecision(item.id!, val)}
                        disabled={!!savingItem}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DECISION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <DecisionIcon decision={item.finalDecision || item.decision} />
                        <span className="text-xs capitalize">
                          {(item.finalDecision || item.decision).replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isReviewable ? (
                      <Textarea
                        className="h-8 min-h-[32px] text-xs resize-none"
                        placeholder="Add notes..."
                        value={itemNotes[item.id!] ?? item.stakeholderNotes ?? ''}
                        onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id!]: e.target.value }))}
                        rows={1}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {item.stakeholderNotes || '—'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isReviewable && itemNotes[item.id!] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleSaveDecision(
                          item.id!,
                          item.finalDecision || item.decision
                        )}
                        disabled={!!savingItem}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
