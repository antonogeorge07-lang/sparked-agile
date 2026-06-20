import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, AlertTriangle, Sparkles, Loader2, X, Check } from "lucide-react";
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

interface Suggestion {
  title: string;
  description: string;
  category: string;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigation_strategy?: string;
}

const emptyForm = {
  risk_title: "",
  description: "",
  category: "Technical",
  probability: "Medium",
  impact: "Medium",
  mitigation_strategy: "",
  owner: "",
};

interface RiskRegisterProps {
  projectId: string | null;
}

export function RiskRegister({ projectId }: RiskRegisterProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (projectId) loadRisks();
  }, [projectId]);

  const loadRisks = async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("risk_register")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load risks");
    else setRisks(data || []);
    setLoading(false);
  };

  const openAdd = (preset?: Partial<typeof emptyForm>) => {
    setForm({ ...emptyForm, ...(preset || {}) });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!projectId) return;
    if (!form.risk_title.trim()) {
      toast.error("Risk title is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("risk_register").insert({
      project_id: projectId,
      risk_title: form.risk_title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      probability: form.probability,
      impact: form.impact,
      mitigation_strategy: form.mitigation_strategy.trim() || null,
      owner: form.owner.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Risk added");
    setOpen(false);
    setForm(emptyForm);
    loadRisks();
  };

  const handleSuggest = async () => {
    if (!projectId) return;
    setSuggesting(true);
    const { data, error } = await supabase.functions.invoke("suggest-pmi-insights", {
      body: { projectId, type: "risks" },
    });
    setSuggesting(false);
    if (error) {
      toast.error(error.message || "Failed to generate suggestions");
      return;
    }
    const list: Suggestion[] = data?.suggestions || [];
    if (list.length === 0) {
      toast.info("No new suggestions right now");
      return;
    }
    setSuggestions(list);
    toast.success(`${list.length} suggestion${list.length > 1 ? "s" : ""} ready for your review`);
  };

  const acceptSuggestion = (s: Suggestion) => {
    openAdd({
      risk_title: s.title,
      description: s.description,
      category: s.category || "Technical",
      probability: s.probability || "Medium",
      impact: s.impact || "Medium",
      mitigation_strategy: s.mitigation_strategy || "",
    });
    setSuggestions((prev) => prev.filter((x) => x !== s));
  };

  const ignoreSuggestion = (s: Suggestion) => {
    setSuggestions((prev) => prev.filter((x) => x !== s));
  };

  const getRiskSeverityColor = (probability: string, impact: string) => {
    const score =
      (probability === "High" ? 3 : probability === "Medium" ? 2 : 1) *
      (impact === "High" ? 3 : impact === "Medium" ? 2 : 1);
    if (score >= 6) return "bg-destructive/10 text-destructive border-destructive/20";
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Risk Register</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSuggest} disabled={suggesting}>
            {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Suggest
          </Button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI suggestions - review and decide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="p-3 rounded-md border bg-background space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{s.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  </div>
                  <Badge variant="outline" className={getRiskSeverityColor(s.probability, s.impact)}>
                    {s.probability} / {s.impact}
                  </Badge>
                </div>
                {s.mitigation_strategy && (
                  <p className="text-xs text-muted-foreground"><span className="font-semibold">Mitigation: </span>{s.mitigation_strategy}</p>
                )}
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => ignoreSuggestion(s)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Ignore
                  </Button>
                  <Button size="sm" onClick={() => acceptSuggestion(s)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Review &amp; Add
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-2"><CardContent className="py-8 text-center"><p className="text-muted-foreground">Loading risks...</p></CardContent></Card>
        ) : risks.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No risks identified yet</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleSuggest} disabled={suggesting}>
                  {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Suggest with AI
                </Button>
                <Button onClick={() => openAdd()}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Risk
                </Button>
              </div>
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
                  <div><span className="text-muted-foreground">Category:</span><Badge variant="secondary" className="ml-2">{risk.category}</Badge></div>
                  <div><span className="text-muted-foreground">Status:</span><Badge variant="secondary" className="ml-2">{risk.status}</Badge></div>
                </div>
                {risk.owner && (<div className="text-sm"><span className="text-muted-foreground">Owner:</span><span className="ml-2 font-medium">{risk.owner}</span></div>)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Risk</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Risk title *</Label>
              <Input value={form.risk_title} onChange={(e) => setForm({ ...form, risk_title: e.target.value })} placeholder="e.g. Vendor delivery delay" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Technical", "Schedule", "Resource", "Scope", "External"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Probability</Label>
                <Select value={form.probability} onValueChange={(v) => setForm({ ...form, probability: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impact</Label>
                <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Mitigation strategy</Label>
              <Textarea value={form.mitigation_strategy} onChange={(e) => setForm({ ...form, mitigation_strategy: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Owner</Label>
              <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Person accountable" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
