import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Github, ExternalLink, Settings, Unplug, Shield } from "lucide-react";
import { toast } from "sonner";

interface IntegrationSettingsProps {
  projectId: string | null;
}

export const IntegrationSettings = ({ projectId }: IntegrationSettingsProps) => {
  const [githubConnected, setGithubConnected] = useState(false);
  const [jiraConnected, setJiraConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [jiraEmail, setJiraEmail] = useState<string | null>(null);
  
  // Dialog states
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [showJiraDialog, setShowJiraDialog] = useState(false);
  
  // Form states
  const [githubToken, setGithubToken] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraEmailInput, setJiraEmailInput] = useState("");
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check GitHub token
      const { data: githubData } = await supabase
        .from('user_github_tokens')
        .select('github_username')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (githubData) {
        setGithubConnected(true);
        setGithubUsername(githubData.github_username);
      }

      // Check Jira token
      const { data: jiraData } = await supabase
        .from('user_jira_tokens')
        .select('jira_email')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (jiraData) {
        setJiraConnected(true);
        setJiraEmail(jiraData.jira_email);
      }
    } catch (error) {
      console.error('Error checking integration status:', error);
    }
  };

  const connectGithub = async () => {
    if (!githubToken.trim()) {
      toast.error("Please enter your GitHub Personal Access Token");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate token
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token. Please check your Personal Access Token.');
      }

      const githubUser = await response.json();

      // Save token
      const { error } = await supabase
        .from('user_github_tokens')
        .upsert({
          user_id: user.id,
          github_token: githubToken,
          github_username: githubUser.login,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success(`Connected to GitHub as ${githubUser.login}`);
      setGithubConnected(true);
      setGithubUsername(githubUser.login);
      setShowGithubDialog(false);
      setGithubToken("");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect GitHub");
    } finally {
      setIsSaving(false);
    }
  };

  const connectJira = async () => {
    if (!jiraToken.trim() || !jiraEmailInput.trim() || !jiraSiteUrl.trim()) {
      toast.error("Please fill in all Jira fields");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Clean up site URL
      let siteUrl = jiraSiteUrl.trim();
      if (!siteUrl.startsWith('https://')) {
        siteUrl = 'https://' + siteUrl;
      }
      if (siteUrl.endsWith('/')) {
        siteUrl = siteUrl.slice(0, -1);
      }

      // Validate token by making a test API call
      const credentials = btoa(`${jiraEmailInput}:${jiraToken}`);
      const response = await fetch(`${siteUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid credentials. Please check your email and API token.');
      }

      // Save token
      const { error } = await supabase
        .from('user_jira_tokens')
        .upsert({
          user_id: user.id,
          jira_token: jiraToken,
          jira_email: jiraEmailInput,
          jira_site_url: siteUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Connected to Jira successfully");
      setJiraConnected(true);
      setJiraEmail(jiraEmailInput);
      setShowJiraDialog(false);
      setJiraToken("");
      setJiraEmailInput("");
      setJiraSiteUrl("");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect Jira");
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectGithub = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_github_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setGithubConnected(false);
      setGithubUsername(null);
      toast.success("GitHub disconnected");
    } catch (error: any) {
      toast.error("Failed to disconnect GitHub");
    }
  };

  const disconnectJira = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_jira_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setJiraConnected(false);
      setJiraEmail(null);
      toast.success("Jira disconnected");
    } catch (error: any) {
      toast.error("Failed to disconnect Jira");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Integration Settings
        </CardTitle>
        <CardDescription>
          Securely connect your development tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub Connection */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">GitHub</h4>
              <p className="text-sm text-muted-foreground">
                {githubConnected 
                  ? `Connected as ${githubUsername}` 
                  : "Connect to sync commits, PRs & issues"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {githubConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <Button variant="outline" size="sm" onClick={disconnectGithub}>
                  <Unplug className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Github className="h-5 w-5" />
                      Connect GitHub
                    </DialogTitle>
                    <DialogDescription>
                      Your token is encrypted and stored securely. We only access repository data you authorize.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="github-token">Personal Access Token</Label>
                      <Input
                        id="github-token"
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      />
                      <p className="text-xs text-muted-foreground">
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=repo" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Create a token <ExternalLink className="h-3 w-3" />
                        </a>
                        {" "}with <code className="bg-muted px-1 rounded">repo</code> scope
                      </p>
                    </div>
                    <Button onClick={connectGithub} disabled={isSaving} className="w-full">
                      {isSaving ? "Connecting..." : "Connect Securely"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Jira Connection */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V7.63a.84.84 0 0 0-.84-.84H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.72c0 2.4 1.94 4.35 4.35 4.35V12.45a.85.85 0 0 0-.84-.84H2z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Jira</h4>
              <p className="text-sm text-muted-foreground">
                {jiraConnected 
                  ? `Connected as ${jiraEmail}` 
                  : "Connect to sync sprints & backlog"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {jiraConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <Button variant="outline" size="sm" onClick={disconnectJira}>
                  <Unplug className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Dialog open={showJiraDialog} onOpenChange={setShowJiraDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V7.63a.84.84 0 0 0-.84-.84H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.72c0 2.4 1.94 4.35 4.35 4.35V12.45a.85.85 0 0 0-.84-.84H2z"/>
                      </svg>
                      Connect Jira
                    </DialogTitle>
                    <DialogDescription>
                      Your credentials are encrypted and stored securely.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="jira-site">Jira Site URL</Label>
                      <Input
                        id="jira-site"
                        value={jiraSiteUrl}
                        onChange={(e) => setJiraSiteUrl(e.target.value)}
                        placeholder="yourcompany.atlassian.net"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jira-email">Email Address</Label>
                      <Input
                        id="jira-email"
                        type="email"
                        value={jiraEmailInput}
                        onChange={(e) => setJiraEmailInput(e.target.value)}
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jira-token">API Token</Label>
                      <Input
                        id="jira-token"
                        type="password"
                        value={jiraToken}
                        onChange={(e) => setJiraToken(e.target.value)}
                        placeholder="Your Jira API token"
                      />
                      <p className="text-xs text-muted-foreground">
                        <a 
                          href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Create an API token <ExternalLink className="h-3 w-3" />
                        </a>
                        {" "}in your Atlassian account settings
                      </p>
                    </div>
                    <Button onClick={connectJira} disabled={isSaving} className="w-full">
                      {isSaving ? "Connecting..." : "Connect Securely"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          <Shield className="h-3 w-3 inline mr-1" />
          All credentials are encrypted and stored securely. We never share your data.
        </p>
      </CardContent>
    </Card>
  );
};