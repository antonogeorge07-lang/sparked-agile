import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Settings, Unplug, Shield, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useIntegrationHealth } from "@/hooks/useIntegrationHealth";
import { ConnectionHealthIndicator } from "@/components/ConnectionHealthIndicator";

interface IntegrationSettingsProps {
  projectId: string | null;
}

// Microsoft Teams/Outlook icon
const MicrosoftIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
  </svg>
);

// Jira icon
const JiraIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V7.63a.84.84 0 0 0-.84-.84H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.72c0 2.4 1.94 4.35 4.35 4.35V12.45a.85.85 0 0 0-.84-.84H2z"/>
  </svg>
);

interface TokenExpiryInfo {
  github?: { expiresAt: string | null; isOAuth: boolean };
  jira?: { expiresAt: string | null; isOAuth: boolean };
  microsoft?: { expiresAt: string | null };
}

export const IntegrationSettings = ({ projectId }: IntegrationSettingsProps) => {
  const { health, validateIntegration, checkHealth } = useIntegrationHealth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<TokenExpiryInfo>({});

  useEffect(() => {
    checkHealth();
    fetchTokenExpiry();
  }, [checkHealth]);

  const fetchTokenExpiry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [githubResult, jiraResult, msResult] = await Promise.all([
        supabase.from('user_github_tokens').select('token_expires_at, oauth_provider').eq('user_id', user.id).single(),
        supabase.from('user_jira_tokens').select('token_expires_at, oauth_provider').eq('user_id', user.id).single(),
        supabase.from('user_microsoft_tokens').select('expires_at').eq('user_id', user.id).single(),
      ]);

      setTokenExpiry({
        github: githubResult.data ? {
          expiresAt: githubResult.data.token_expires_at,
          isOAuth: githubResult.data.oauth_provider === 'oauth'
        } : undefined,
        jira: jiraResult.data ? {
          expiresAt: jiraResult.data.token_expires_at,
          isOAuth: jiraResult.data.oauth_provider === 'oauth'
        } : undefined,
        microsoft: msResult.data ? {
          expiresAt: msResult.data.expires_at
        } : undefined,
      });
    } catch (error) {
      console.error('Failed to fetch token expiry:', error);
    }
  };

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 0) {
      return { status: 'expired', label: 'Expired', variant: 'destructive' as const };
    } else if (hoursUntilExpiry <= 24) {
      return { status: 'expiring', label: 'Expires soon', variant: 'secondary' as const };
    }
    return null;
  };

  const connectGithubOAuth = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth-init', {
        body: { redirectUrl: window.location.pathname }
      });

      if (error) throw error;
      if (!data?.authUrl) throw new Error('Failed to get OAuth URL');

      // Redirect to GitHub OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('GitHub OAuth init error:', error);
      toast.error(error.message || "Failed to start GitHub OAuth");
      setIsSaving(false);
    }
  };

  const connectJiraOAuth = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('jira-oauth-init', {
        body: { redirectUrl: window.location.pathname }
      });

      if (error) throw error;
      if (!data?.authUrl) throw new Error('Failed to get OAuth URL');

      // Redirect to Jira OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Jira OAuth init error:', error);
      toast.error(error.message || "Failed to start Jira OAuth");
      setIsSaving(false);
    }
  };

  const connectMicrosoft = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-microsoft-client-id");
      if (error) throw error;
      if (!data?.clientId) {
        toast.error("Microsoft credentials not configured. Please contact administrator.");
        return;
      }
      
      const redirectUri = `${window.location.origin}/dashboard`;
      const scopes = "Calendars.ReadWrite offline_access User.Read Group.ReadWrite.All Channel.Create";
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${data.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&prompt=consent`;
      
      window.location.href = authUrl;
    } catch (e: any) {
      toast.error(`Unable to start Microsoft sign-in: ${e.message}`);
    }
  };

  const refreshToken = async (integrationType: 'jira' | 'microsoft') => {
    setIsRefreshing(integrationType);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-integration-token', {
        body: { integrationType }
      });

      if (error) throw error;

      toast.success(`${integrationType === 'jira' ? 'Jira' : 'Microsoft'} token refreshed successfully`);
      fetchTokenExpiry();
      checkHealth();
    } catch (error: any) {
      console.error('Token refresh error:', error);
      toast.error(error.message || `Failed to refresh ${integrationType} token`);
    } finally {
      setIsRefreshing(null);
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

      toast.success("GitHub disconnected");
      checkHealth();
      fetchTokenExpiry();
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

      toast.success("Jira disconnected");
      checkHealth();
      fetchTokenExpiry();
    } catch (error: any) {
      toast.error("Failed to disconnect Jira");
    }
  };

  const disconnectMicrosoft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_microsoft_tokens')
        .delete()
        .eq('user_id', user.id);

      // No localStorage to remove - tokens stored securely in database

      toast.success("Microsoft disconnected");
      checkHealth();
      fetchTokenExpiry();
    } catch (error: any) {
      toast.error("Failed to disconnect Microsoft");
    }
  };

  // Handle OAuth callback results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get('github');
    const jiraStatus = params.get('jira');
    const errorMessage = params.get('message');

    if (githubStatus === 'success') {
      toast.success('GitHub connected successfully via OAuth');
      checkHealth();
      fetchTokenExpiry();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (githubStatus === 'error') {
      toast.error(`GitHub OAuth failed: ${errorMessage || 'Unknown error'}`);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (jiraStatus === 'success') {
      toast.success('Jira connected successfully via OAuth');
      checkHealth();
      fetchTokenExpiry();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (jiraStatus === 'error') {
      toast.error(`Jira OAuth failed: ${errorMessage || 'Unknown error'}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const jiraExpiry = getExpiryStatus(tokenExpiry.jira?.expiresAt || null);
  const msExpiry = getExpiryStatus(tokenExpiry.microsoft?.expiresAt || null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integration Settings
            </CardTitle>
            <CardDescription>
              Securely connect your development tools with OAuth. Tokens are encrypted with AES-256.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { checkHealth(); fetchTokenExpiry(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub Connection */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">GitHub</h4>
                {tokenExpiry.github?.isOAuth && (
                  <Badge variant="secondary" className="text-xs">OAuth</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {health.github.connected 
                  ? `Connected as ${health.github.identifier}` 
                  : "Connect to sync commits, PRs & issues"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionHealthIndicator
              connected={health.github.connected}
              isValid={health.github.isValid}
              lastValidated={health.github.lastValidated}
              error={health.github.error}
              isChecking={health.github.isChecking}
              onValidate={() => validateIntegration('github')}
            />
            {health.github.connected ? (
              <Button variant="outline" size="sm" onClick={disconnectGithub}>
                <Unplug className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={connectGithubOAuth} disabled={isSaving}>
                <Shield className="h-4 w-4 mr-1" />
                {isSaving ? "Connecting..." : "Connect with OAuth"}
              </Button>
            )}
          </div>
        </div>

        {/* Jira Connection */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <JiraIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Jira</h4>
                {tokenExpiry.jira?.isOAuth && (
                  <Badge variant="secondary" className="text-xs">OAuth</Badge>
                )}
                {jiraExpiry && (
                  <Badge variant={jiraExpiry.variant} className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {jiraExpiry.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {health.jira.connected 
                  ? `Connected as ${health.jira.identifier}` 
                  : "Connect to sync sprints & backlog"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionHealthIndicator
              connected={health.jira.connected}
              isValid={health.jira.isValid}
              lastValidated={health.jira.lastValidated}
              error={health.jira.error}
              isChecking={health.jira.isChecking}
              onValidate={() => validateIntegration('jira')}
            />
            {health.jira.connected ? (
              <div className="flex gap-2">
                {tokenExpiry.jira?.isOAuth && jiraExpiry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refreshToken('jira')}
                    disabled={isRefreshing === 'jira'}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing === 'jira' ? 'animate-spin' : ''}`} />
                    Refresh Token
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={disconnectJira}>
                  <Unplug className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={connectJiraOAuth} disabled={isSaving}>
                <Shield className="h-4 w-4 mr-1" />
                {isSaving ? "Connecting..." : "Connect with OAuth"}
              </Button>
            )}
          </div>
        </div>

        {/* Microsoft Teams/Outlook Connection */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MicrosoftIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Microsoft Teams & Outlook</h4>
                {health.microsoft.connected && (
                  <Badge variant="secondary" className="text-xs">OAuth</Badge>
                )}
                {msExpiry && (
                  <Badge variant={msExpiry.variant} className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {msExpiry.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {health.microsoft.connected 
                  ? `Connected as ${health.microsoft.identifier}` 
                  : "Connect for calendar & channels"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionHealthIndicator
              connected={health.microsoft.connected}
              isValid={health.microsoft.isValid}
              lastValidated={health.microsoft.lastValidated}
              error={health.microsoft.error}
              isChecking={health.microsoft.isChecking}
              onValidate={() => validateIntegration('microsoft')}
            />
            {health.microsoft.connected ? (
              <div className="flex gap-2">
                {msExpiry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refreshToken('microsoft')}
                    disabled={isRefreshing === 'microsoft'}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing === 'microsoft' ? 'animate-spin' : ''}`} />
                    Refresh Token
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={disconnectMicrosoft}>
                  <Unplug className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={connectMicrosoft}>
                <Shield className="h-4 w-4 mr-1" />
                Connect with OAuth
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>All tokens are encrypted with AES-256-GCM before storage.</span>
          <Clock className="h-3 w-3 ml-2" />
          <span>Automatic expiry monitoring & refresh.</span>
        </div>
      </CardContent>
    </Card>
  );
};
