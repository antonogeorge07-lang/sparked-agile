import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Lightbulb, Sparkles, Loader2, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  created_at: string;
}

interface Suggestion {
  title: string;
  description: string;
  category: string;
  impact: "Low" | "Medium" | "High";
}

const emptyForm = {
  title: "",
  description: "",
  category: "Process",
  impact: "Medium",
};

interface LessonsLearnedProps {
  projectId: string | null;
}

export function LessonsLearned({ projectId }: LessonsLearnedProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (projectId) loadLessons();
  }, [projectId]);

  const loadLessons = async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("lessons_learned")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load lessons learned");
    else setLessons(data || []);
    setLoading(false);
  };

  const openAdd = (preset?: Partial<typeof emptyForm>) => {
    setForm({ ...emptyForm, ...(preset || {}) });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!projectId) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("lessons_learned").insert({
      project_id: projectId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      impact: form.impact,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Lesson recorded");
    setOpen(false);
    setForm(emptyForm);
    loadLessons();
  };

  const handleSuggest = async () => {
    if (!projectId) return;
    setSuggesting(true);
    const { data, error } = await supabase.functions.invoke("suggest-pmi-insights", {
      body: { projectId, type: "lessons" },
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
    openAdd({ title: s.title, description: s.description, category: s.category || "Process", impact: s.impact || "Medium" });
    setSuggestions((prev) => prev.filter((x) => x !== s));
  };

  const ignoreSuggestion = (s: Suggestion) => setSuggestions((prev) => prev.filter((x) => x !== s));

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-accent/10 text-accent border-accent/20";
      case "Medium": return "bg-secondary/10 text-secondary border-secondary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (!projectId) {
    return (
      <Card className="border-2">
        <CardContent className="py-12 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a project to view lessons learned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Lessons Learned</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSuggest} disabled={suggesting}>
            {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Suggest
          </Button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
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
                  <Badge variant="outline" className={getImpactColor(s.impact)}>{s.impact} Impact</Badge>
                </div>
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
          <Card className="border-2"><CardContent className="py-8 text-center"><p className="text-muted-foreground">Loading lessons...</p></CardContent></Card>
        ) : lessons.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No lessons documented yet</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleSuggest} disabled={suggesting}>
                  {suggesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Suggest with AI
                </Button>
                <Button onClick={() => openAdd()}>
                  <Plus className="h-4 w-4 mr-2" /> Document First Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          lessons.map((lesson) => (
            <Card key={lesson.id} className="border-2 hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex-1">{lesson.title}</CardTitle>
                  <Badge variant="outline" className={getImpactColor(lesson.impact)}>{lesson.impact} Impact</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Badge variant="secondary">{lesson.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(lesson.created_at), "MMM dd, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Lesson Learned</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What did you learn?" />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Context, what happened, what to apply next time" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Process", "Technical", "Communication", "Resource", "Other"].map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
