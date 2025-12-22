import { useState } from "react";
import { Github, Mail, Loader2, RefreshCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DigestSummary {
  done: string;
  blocked: string;
  focus: string;
}

interface DigestResponse {
  repo: string;
  date: string;
  summary: DigestSummary;
  raw_count: number;
  processing_time_ms: number;
  error?: string;
}

interface Project {
  id: string;
  name: string;
}

interface GitHubDigestCardProps {
  projects: Project[];
  selectedProjectId?: string;
  onProjectChange?: (projectId: string) => void;
}

export function GitHubDigestCard({ projects, selectedProjectId, onProjectChange }: GitHubDigestCardProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [projectId, setProjectId] = useState(selectedProjectId || "");

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    setDigest(null);
    onProjectChange?.(value);
  };

  const generateDigest = async () => {
    if (!projectId) {
      toast({
        title: "Select a project",
        description: "Please select a project to generate the digest for.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setDigest(null);

    try {
      const { data, error } = await supabase.functions.invoke('github-digest', {
        body: { projectId }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Digest Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setDigest(data);
      toast({
        title: "Digest Generated",
        description: `Analyzed ${data.raw_count} events in ${(data.processing_time_ms / 1000).toFixed(1)}s`,
      });
    } catch (error: any) {
      console.error("Failed to generate digest:", error);
      toast({
        title: "Failed to generate digest",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendDigestEmail = async () => {
    if (!digest || !emailAddress) {
      toast({
        title: "Missing information",
        description: "Generate a digest and enter an email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const { error } = await supabase.functions.invoke('send-digest-email', {
        body: { 
          email: emailAddress,
          digest
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Digest sent to ${emailAddress}`,
      });
      setSendEmail(false);
      setEmailAddress("");
    } catch (error: any) {
      console.error("Failed to send email:", error);
      toast({
        title: "Failed to send email",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Card className="relative overflow-hidden transition-all border-primary/20">
      {/* Status bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        digest ? "bg-green-500" : "bg-primary/30"
      )} />

      <CardHeader className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Github className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">GitHub Daily Digest</CardTitle>
              <CardDescription className="text-xs">
                AI-powered 24-hour activity summary
              </CardDescription>
            </div>
          </div>
          {digest && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label htmlFor="digest-project">Project</Label>
          <Select value={projectId} onValueChange={handleProjectChange}>
            <SelectTrigger id="digest-project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateDigest} 
          disabled={isGenerating || !projectId}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Daily Digest
            </>
          )}
        </Button>

        {/* Digest Results */}
        {digest && (
          <div className="space-y-4 pt-2">
            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{digest.repo}</span>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {digest.date}
              </div>
            </div>

            {/* Summary Sections */}
            <div className="space-y-3">
              {/* Done */}
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Completed</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{digest.summary.done}</p>
              </div>

              {/* Blocked */}
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Pending / Blocked</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{digest.summary.blocked}</p>
              </div>

              {/* Focus */}
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Focus Today</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{digest.summary.focus}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
              <span>{digest.raw_count} events analyzed</span>
              <span>{(digest.processing_time_ms / 1000).toFixed(1)}s processing</span>
            </div>

            {/* Email Option */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="send-email" className="text-sm">Send via Email</Label>
                </div>
                <Switch
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                />
              </div>

              {sendEmail && (
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="team@company.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendDigestEmail} 
                    disabled={isSendingEmail || !emailAddress}
                    size="sm"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
