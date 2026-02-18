import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMeetingNotes, MeetingActionItem, MeetingDecision, MeetingTopic } from "@/hooks/useMeetingNotes";
import { FileText, Loader2, CheckCircle2, AlertCircle, MessageSquare, ClipboardList, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MeetingNotesProcessorProps {
  projectId: string | null;
}

const sentimentColors: Record<string, string> = {
  positive: "bg-green-500/10 text-green-700 border-green-500/30",
  neutral: "bg-muted text-muted-foreground",
  negative: "bg-destructive/10 text-destructive border-destructive/30",
  mixed: "bg-orange-500/10 text-orange-700 border-orange-500/30",
};

export function MeetingNotesProcessor({ projectId }: MeetingNotesProcessorProps) {
  const { isProcessing, analysis, processNotes, loadNotes, savedNotes } = useMeetingNotes();
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState("general");
  const [rawNotes, setRawNotes] = useState("");

  const handleProcess = async () => {
    if (!projectId || !title || !rawNotes) return;
    await processNotes({ projectId, title, meetingType, rawNotes });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Process Meeting Notes
          </CardTitle>
          <CardDescription>
            Paste meeting notes and AI will extract decisions, action items, and key topics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sprint 12 Planning" />
            </div>
            <div>
              <Label>Meeting Type</Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standup">Standup</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="retro">Retrospective</SelectItem>
                  <SelectItem value="review">Sprint Review</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Meeting Notes</Label>
            <Textarea
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste your meeting notes, transcript, or minutes here..."
              className="min-h-[200px]"
            />
          </div>
          <Button onClick={handleProcess} disabled={isProcessing || !title || !rawNotes || !projectId} className="w-full">
            {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
            ) : (
              <><Lightbulb className="mr-2 h-4 w-4" />Extract Insights</>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="decisions">Decisions ({analysis.decisions.length})</TabsTrigger>
                <TabsTrigger value="actions">Actions ({analysis.actionItems.length})</TabsTrigger>
                <TabsTrigger value="topics">Topics ({analysis.keyTopics.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{analysis.summary}</p>
                </div>
              </TabsContent>

              <TabsContent value="decisions">
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {analysis.decisions.map((d, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{d.decision}</p>
                            {d.rationale && <p className="text-xs text-muted-foreground mt-1">{d.rationale}</p>}
                            {d.owner && <Badge variant="outline" className="mt-1 text-xs">{d.owner}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="actions">
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {analysis.actionItems.map((a, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <ClipboardList className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{a.action}</p>
                              {a.assignee && <p className="text-xs text-muted-foreground mt-1">Assigned: {a.assignee}</p>}
                              {a.due_date_suggestion && <p className="text-xs text-muted-foreground">Due: {a.due_date_suggestion}</p>}
                            </div>
                          </div>
                          <Badge variant={a.priority === 'high' ? 'destructive' : a.priority === 'medium' ? 'default' : 'secondary'}>
                            {a.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="topics">
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {analysis.keyTopics.map((t, i) => (
                      <div key={i} className={`p-3 border rounded-lg ${sentimentColors[t.sentiment]}`}>
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{t.topic}</p>
                              <Badge variant="outline" className="text-xs">{t.sentiment}</Badge>
                            </div>
                            {t.notes && <p className="text-xs mt-1 opacity-80">{t.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
