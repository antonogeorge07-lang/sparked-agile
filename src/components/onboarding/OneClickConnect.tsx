import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Network, CheckCircle2, Loader2, ArrowRight, Zap, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

interface Project {
  id: string;
  name: string;
}

type ConnectionType = "github" | "jira" | null;

interface ConnectionState {
  status: "idle" | "connecting" | "success" | "error";
  message?: string;
}

export const OneClickConnect = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<ConnectionType>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // GitHub state
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubState, setGithubState] = useState<ConnectionState>({ status: "idle" });

  // Jira state
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");
  const [jiraBoardUrl, setJiraBoardUrl] = useState("");
  const [jiraState, setJiraState] = useState<ConnectionState>({ status: "idle" });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setProjects(data);
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const connectGithub = async () => {
    if (!githubUrl.trim() || !selectedProjectId) {
      toast.error("Please enter a GitHub repo URL and select a project");
      return;
    }

    setGithubState({ status: "connecting" });

    try {
      const { data, error } = await supabase.functions.invoke("connect-github", {
        body: {
          githubRepoUrl: githubUrl.trim(),
          projectId: selectedProjectId,
          githubToken: githubToken.trim() || undefined,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setGithubState({
        status: "success",
        message: `Connected to ${data.repoName}`,
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      toast.success(`GitHub connected: ${data.repoName}`);
    } catch (err: any) {
      setGithubState({
        status: "error",
        message: err.message || "Connection failed",
      });
      toast.error(err.message || "Failed to connect GitHub");
    }
  };

  const connectJira = async () => {
    if (!jiraBoardUrl.trim() || !jiraSiteUrl.trim() || !selectedProjectId) {
      toast.error("Please fill in all Jira fields and select a project");
      return;
    }

    setJiraState({ status: "connecting" });

    try {
      const siteUrl = jiraSiteUrl.trim().startsWith("https://")
        ? jiraSiteUrl.trim()
        : `https://${jiraSiteUrl.trim()}`;

      const { data, error } = await supabase.functions.invoke("connect-jira", {
        body: {
          jiraBoardUrl: jiraBoardUrl.trim(),
          jiraSiteUrl: siteUrl,
          projectId: selectedProjectId,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setJiraState({
        status: "success",
        message: `Connected to ${data.boardName}`,
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      toast.success(`Jira connected: ${data.boardName}`);
    } catch (err: any) {
      setJiraState({
        status: "error",
        message: err.message || "Connection failed",
      });
      toast.error(err.message || "Failed to connect Jira");
    }
  };

  const resetSelection = () => {
    setSelectedType(null);
    setGithubState({ status: "idle" });
    setJiraState({ status: "idle" });
    setGithubUrl("");
    setGithubToken("");
    setJiraSiteUrl("");
    setJiraBoardUrl("");
  };

  const isConnected = githubState.status === "success" || jiraState.status === "success";

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Connect to project</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loadingProjects ? (
        <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-3">Create a project first to connect integrations</p>
            <Button onClick={() => navigate("/project-command-centre")} variant="outline">
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          {!selectedType ? (
            /* Service Selection */
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <ServiceCard
                title="GitHub"
                description="Connect your repository to track commits, PRs, and issues"
                icon={<Github className="h-8 w-8" />}
                onClick={() => setSelectedType("github")}
                accentClass="from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.6)]"
              />
              <ServiceCard
                title="Jira"
                description="Connect your board to sync sprints, tickets, and backlogs"
                icon={<Network className="h-8 w-8" />}
                onClick={() => setSelectedType("jira")}
                accentClass="from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]"
              />
            </motion.div>
          ) : selectedType === "github" ? (
            /* GitHub Connect */
            <motion.div
              key="github"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Github className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Connect GitHub</CardTitle>
                        <CardDescription>Paste your repo URL, add a token, connect</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetSelection}>
                      ← Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">Repository URL *</Label>
                    <Input
                      id="github-url"
                      placeholder="https://github.com/org/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      disabled={githubState.status === "success"}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-token">
                      Personal Access Token
                      <span className="text-muted-foreground text-xs ml-1">(optional if system token configured)</span>
                    </Label>
                    <Input
                      id="github-token"
                      type="password"
                      placeholder="ghp_..."
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      disabled={githubState.status === "success"}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Spark-Agile"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Generate a token with repo scope
                      </a>
                    </p>
                  </div>

                  <StatusMessage state={githubState} />

                  {githubState.status !== "success" ? (
                    <Button
                      onClick={connectGithub}
                      disabled={!githubUrl.trim() || githubState.status === "connecting"}
                      className="w-full h-11 gap-2"
                    >
                      {githubState.status === "connecting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {githubState.status === "connecting" ? "Connecting..." : "Connect GitHub"}
                    </Button>
                  ) : (
                    <SuccessActions onAnother={resetSelection} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Jira Connect */
            <motion.div
              key="jira"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        <Network className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Connect Jira</CardTitle>
                        <CardDescription>Paste your site & board URL, connect</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetSelection}>
                      ← Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jira-site">Jira Site URL *</Label>
                    <Input
                      id="jira-site"
                      placeholder="yourcompany.atlassian.net"
                      value={jiraSiteUrl}
                      onChange={(e) => setJiraSiteUrl(e.target.value)}
                      disabled={jiraState.status === "success"}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jira-board">Board URL *</Label>
                    <Input
                      id="jira-board"
                      placeholder="https://yourcompany.atlassian.net/jira/software/projects/PROJ/boards/1"
                      value={jiraBoardUrl}
                      onChange={(e) => setJiraBoardUrl(e.target.value)}
                      disabled={jiraState.status === "success"}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Open your Jira board and copy the URL from your browser
                    </p>
                  </div>

                  <StatusMessage state={jiraState} />

                  {jiraState.status !== "success" ? (
                    <Button
                      onClick={connectJira}
                      disabled={
                        !jiraSiteUrl.trim() ||
                        !jiraBoardUrl.trim() ||
                        jiraState.status === "connecting"
                      }
                      className="w-full h-11 gap-2"
                    >
                      {jiraState.status === "connecting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {jiraState.status === "connecting" ? "Connecting..." : "Connect Jira"}
                    </Button>
                  ) : (
                    <SuccessActions onAnother={resetSelection} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

/* ─── Sub-components ─── */

const ServiceCard = ({
  title,
  description,
  icon,
  onClick,
  accentClass,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  accentClass: string;
}) => (
  <Card
    className="group cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all duration-200"
    onClick={onClick}
  >
    <CardContent className="pt-6 text-center space-y-3">
      <div
        className={cn(
          "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white",
          accentClass
        )}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center justify-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Connect <ArrowRight className="h-4 w-4" />
      </div>
    </CardContent>
  </Card>
);

const StatusMessage = ({ state }: { state: ConnectionState }) => {
  if (state.status === "idle" || state.status === "connecting") return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={cn(
        "rounded-lg p-3 text-sm flex items-center gap-2",
        state.status === "success" && "bg-primary/10 text-primary",
        state.status === "error" && "bg-destructive/10 text-destructive"
      )}
    >
      {state.status === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
      {state.message}
    </motion.div>
  );
};

const SuccessActions = ({ onAnother }: { onAnother: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onAnother} className="flex-1 gap-2">
        <Sparkles className="h-4 w-4" />
        Connect another
      </Button>
      <Button onClick={() => navigate("/dashboard")} className="flex-1 gap-2">
        Go to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
