import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "epic" | "feature";
  entityId: string;
  workspaceId: string;
  onSaved?: () => void;
}

type Band = "high" | "medium" | "low";
type ValueType = "revenue" | "cost_saving" | "risk_reduction" | "customer" | "compliance";
type Conf = "low" | "medium" | "high";

export function ValueTagDialog({ open, onOpenChange, entityType, entityId, workspaceId, onSaved }: Props) {
  const [band, setBand] = useState<Band>("medium");
  const [valueType, setValueType] = useState<ValueType>("revenue");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("GBP");
  const [confidence, setConfidence] = useState<Conf>("medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("business_value_tags")
        .select("id, value_band, value_type, estimated_amount, currency, confidence, notes")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setBand(data.value_band as Band);
        setValueType(data.value_type as ValueType);
        setAmount(data.estimated_amount ? String(data.estimated_amount) : "");
        setCurrency(data.currency ?? "GBP");
        setConfidence(data.confidence as Conf);
        setNotes(data.notes ?? "");
      } else {
        setExistingId(null);
      }
    })();
  }, [open, entityType, entityId]);

  const save = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const payload = {
        workspace_id: workspaceId,
        entity_type: entityType,
        entity_id: entityId,
        value_band: band,
        value_type: valueType,
        estimated_amount: amount ? Number(amount) : null,
        currency: amount ? currency : null,
        confidence,
        notes: notes || null,
        tagged_by: session.user.id,
      };

      const { error } = existingId
        ? await supabase.from("business_value_tags").update(payload).eq("id", existingId)
        : await supabase.from("business_value_tags").insert(payload);
      if (error) throw error;

      toast.success(existingId ? "Value tag updated" : "Value tag saved");
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tag business value
          </DialogTitle>
          <DialogDescription>
            How much value does shipping this {entityType} create? Used by the decision simulator to project what is really worth doing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Value band</Label>
              <Select value={band} onValueChange={(v) => setBand(v as Band)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High impact</SelectItem>
                  <SelectItem value="medium">Medium impact</SelectItem>
                  <SelectItem value="low">Low impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value type</Label>
              <Select value={valueType} onValueChange={(v) => setValueType(v as ValueType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="cost_saving">Cost saving</SelectItem>
                  <SelectItem value="risk_reduction">Risk reduction</SelectItem>
                  <SelectItem value="customer">Customer outcome</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <Label>Estimated amount (optional)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 120000"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Confidence</Label>
            <Select value={confidence} onValueChange={(v) => setConfidence(v as Conf)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (validated)</SelectItem>
                <SelectItem value="medium">Medium (best estimate)</SelectItem>
                <SelectItem value="low">Low (hypothesis)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you arrive at this number? Which customer or risk does it tie to?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : existingId ? "Update tag" : "Save tag"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
