import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Unplug,
  ExternalLink,
  Shield,
  Loader2,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useIntegrationHealth } from "@/hooks/useIntegrationHealth";
import { getOAuthCallbackUrl, getOAuthOrigin } from "@/lib/oauth";
import { useSlackIntegration } from "@/hooks/useSlackIntegration";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface IntegrationCardData {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  oauthConnect?: () => void;
}

export const IntegrationDashboard = () => {
  const { health, validateIntegration, checkHealth, isLoading } = useIntegrationHealth();
  const { 
    connection: slackConnection, 
    isConnecting: slackConnecting, 
    connectSlack, 
    disconnectSlack,
    handleOAuthCallback: handleSlackCallback,
    checkConnection: checkSlackConnection
  } = useSlackIntegration();
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [disconnectDialog, setDisconnectDialog] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<Record<string, { expiresAt: string | null; isOAuth: boolean }>>({});
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string | null>>({});

  useEffect(() => {
    checkHealth();
    fetchTokenExpiry();
    fetchLastSyncTimes();
  }, []);

  // Handle Slack OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slackCode = params.get('code');
    const slackState = params.get('state');
    const storedState = sessionStorage.getItem('slack_oauth_state');
    
    if (slackCode && slackState && storedState === slackState) {
      sessionStorage.removeItem('slack_oauth_state');
      handleSlackCallback(slackCode)
        .then(({ teamName }) => {
          toast.success(`Slack connected to ${teamName}`);
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch((error) => {
          toast.error(`Slack connection failed: ${error.message}`);
          window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }, [handleSlackCallback]);

  const fetchTokenExpiry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [githubResult, jiraResult, msResult] = await Promise.all([
        supabase.from('user_github_tokens').select('token_expires_at, oauth_provider, updated_at').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_jira_tokens').select('token_expires_at, oauth_provider, updated_at').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_microsoft_token_status').select('expires_at, updated_at').maybeSingle(),
      ]);

      setTokenExpiry({
        github: {
          expiresAt: githubResult.data?.token_expires_at || null,
          isOAuth: githubResult.data?.oauth_provider === 'oauth'
        },
        jira: {
          expiresAt: jiraResult.data?.token_expires_at || null,
          isOAuth: jiraResult.data?.oauth_provider === 'oauth'
        },
        microsoft: {
          expiresAt: msResult.data?.expires_at || null,
          isOAuth: true
        },
      });

      setLastSyncTimes({
        github: githubResult.data?.updated_at || null,
        jira: jiraResult.data?.updated_at || null,
        microsoft: msResult.data?.updated_at || null,
      });
    } catch (error) {
      console.error('Failed to fetch token expiry:', error);
    }
  };

  const fetchLastSyncTimes = async () => {
    // This would fetch from integration_events or similar
    // For now, using token update times
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
    } else if (hoursUntilExpiry <= 168) { // 7 days
      return { status: 'warning', label: `${Math.ceil(hoursUntilExpiry / 24)}d left`, variant: 'outline' as const };
    }
    return null;
  };

  const connectGithubOAuth = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-oauth-init', {
        body: { redirectUrl: window.location.pathname, origin: getOAuthOrigin() }
      });
      if (error) throw error;
      if (!data?.authUrl) throw new Error('Failed to get OAuth URL');
      window.location.href = data.authUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to start GitHub OAuth");
      setIsSaving(false);
    }
  };

  const connectJiraOAuth = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('jira-oauth-init', {
        body: { redirectUrl: window.location.pathname, origin: getOAuthOrigin() }
      });
      if (error) throw error;
      if (!data?.authUrl) throw new Error('Failed to get OAuth URL');
      window.location.href = data.authUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to start Jira OAuth");
      setIsSaving(false);
    }
  };

  const connectMicrosoft = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-microsoft-client-id");
      if (error) throw error;
      if (!data?.clientId) {
        toast.error("Microsoft credentials not configured");
        return;
      }
      
      const redirectUri = getOAuthCallbackUrl("microsoft");
      sessionStorage.setItem('microsoft_redirect_path', window.location.pathname);
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
      const { error } = await supabase.functions.invoke('refresh-integration-token', {
        body: { integrationType }
      });
      if (error) throw error;
      toast.success(`${integrationType === 'jira' ? 'Jira' : 'Microsoft'} token refreshed`);
      fetchTokenExpiry();
      checkHealth();
    } catch (error: any) {
      toast.error(error.message || `Failed to refresh token`);
    } finally {
      setIsRefreshing(null);
    }
  };

  const disconnectService = async (service: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (service === 'slack') {
        await disconnectSlack();
        toast.success('Slack disconnected');
        setDisconnectDialog(null);
        return;
      }

      const table = service === 'github' 
        ? 'user_github_tokens' 
        : service === 'jira' 
        ? 'user_jira_tokens' 
        : 'user_microsoft_tokens';

      const { error } = await supabase.from(table).delete().eq('user_id', user.id);
      if (error) throw error;

      toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} disconnected`);
      checkHealth();
      fetchTokenExpiry();
    } catch (error: any) {
      toast.error(`Failed to disconnect ${service}`);
    }
    setDisconnectDialog(null);
  };

  const connectSlackOAuth = async () => {
    try {
      await connectSlack();
    } catch (error: any) {
      toast.error(error.message || "Failed to start Slack OAuth");
    }
  };

  const integrations: IntegrationCardData[] = [
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-6 w-6" />,
      description: 'Sync commits, pull requests, and issues',
      features: ['Commit tracking', 'PR status', 'Issue sync', 'Branch monitoring'],
      oauthConnect: connectGithubOAuth,
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: <JiraIcon />,
      description: 'Connect sprints, backlog, and stories',
      features: ['Sprint sync', 'Backlog items', 'Story points', 'Epic tracking'],
      oauthConnect: connectJiraOAuth,
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      icon: <MicrosoftIcon />,
      description: 'Calendar events and Teams channels',
      features: ['Calendar sync', 'Meeting invites', 'Teams channels', 'Outlook events'],
      oauthConnect: connectMicrosoft,
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: <MessageSquare className="h-6 w-6" />,
      description: 'Notifications and team updates',
      features: ['Ceremony reminders', 'Project updates', 'AI summaries', 'Team notifications'],
      oauthConnect: connectSlackOAuth,
    },
  ];

  // Merge Slack into health object for unified display
  const extendedHealth = {
    ...health,
    slack: {
      connected: !!slackConnection,
      isValid: slackConnection?.isValid ?? false,
      identifier: slackConnection?.teamName || null,
      lastValidated: slackConnection?.lastValidated ? new Date(slackConnection.lastValidated) : null,
      error: null,
      isChecking: slackConnecting,
    }
  };

  const connectedCount = Object.values(extendedHealth).filter(h => h.connected).length;
  const healthyCount = Object.values(extendedHealth).filter(h => h.connected && h.isValid).length;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Integration Dashboard
              </CardTitle>
              <CardDescription>
                Centralized view of all connected services
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{connectedCount}/3</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { checkHealth(); fetchTokenExpiry(); }}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">{healthyCount} Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">
                {connectedCount - healthyCount} Needs Attention
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">{4 - connectedCount} Not Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reconnect banner */}
      {Object.values(health).some(h => h.needsReconnect) && (
        <Card className="border-orange-500/40 bg-orange-500/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {Object.values(health).filter(h => h.needsReconnect).map(h => h.type).join(', ')} need to be reconnected
                </p>
                <p className="text-xs text-muted-foreground">
                  Your token has expired or been revoked. Reconnect to resume live data sync.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {integrations
                .filter(i => health[i.id as keyof typeof health]?.needsReconnect && i.oauthConnect)
                .map(i => (
                  <Button
                    key={i.id}
                    size="sm"
                    onClick={i.oauthConnect}
                    className="gap-2"
                  >
                    <Shield className="h-3 w-3" />
                    Reconnect {i.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {integrations.map((integration) => {
          const healthData = extendedHealth[integration.id as keyof typeof extendedHealth];
          const expiry = tokenExpiry[integration.id];
          const expiryStatus = getExpiryStatus(expiry?.expiresAt || null);
          const lastSync = lastSyncTimes[integration.id];

          return (
            <Card 
              key={integration.id}
              className={cn(
                "relative overflow-hidden transition-all",
                healthData?.connected && healthData.isValid && "border-green-500/30",
                healthData?.connected && !healthData.isValid && "border-orange-500/30",
              )}
            >
              {/* Status indicator bar */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1",
                healthData?.connected && healthData.isValid && "bg-green-500",
                healthData?.connected && !healthData.isValid && "bg-orange-500",
                !healthData?.connected && "bg-muted"
              )} />

              <CardHeader className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      healthData?.connected ? "bg-primary/10" : "bg-muted"
                    )}>
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {healthData?.connected ? (
                      healthData.isValid ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {healthData?.connected ? (
                  <>
                    {/* Connected user info */}
                    <div className="space-y-2">
                      {healthData.identifier && (
                        <p className="text-sm text-muted-foreground">
                          Signed in as <span className="font-medium text-foreground">{healthData.identifier}</span>
                        </p>
                      )}
                      
                      {/* Sync Status */}
                      {lastSync && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Last synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}
                        </div>
                      )}

                      {/* Token Expiry Warning */}
                      {expiryStatus && (
                        <div className="flex items-center gap-2">
                          <Badge variant={expiryStatus.variant} className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {expiryStatus.label}
                          </Badge>
                        </div>
                      )}

                      {/* Error Message */}
                      {healthData.error && (
                        <p className="text-xs text-destructive">{healthData.error}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {(healthData as any)?.needsReconnect && integration.oauthConnect && (
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={integration.oauthConnect}
                          disabled={isSaving}
                        >
                          <Shield className="h-3 w-3" />
                          Reconnect
                        </Button>
                      )}
                      {(integration.id === 'jira' || integration.id === 'microsoft') && expiryStatus && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => refreshToken(integration.id as 'jira' | 'microsoft')}
                          disabled={isRefreshing === integration.id}
                        >
                          <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing === integration.id && "animate-spin")} />
                          Refresh
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => validateIntegration(integration.id as 'github' | 'jira' | 'microsoft')}
                        disabled={healthData.isChecking}
                      >
                        {healthData.isChecking ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        Test
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDisconnectDialog(integration.id)}
                      >
                        <Unplug className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Features list for disconnected state */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Available features:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Connect button */}
                    <Button 
                      className="w-full gap-2" 
                      onClick={integration.oauthConnect}
                      disabled={isSaving}
                    >
                      <Shield className="h-4 w-4" />
                      Connect with OAuth
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>AES-256 Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Auto Token Refresh</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>OAuth 2.0 Secure</span>
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={!!disconnectDialog} onOpenChange={() => setDisconnectDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {disconnectDialog?.charAt(0).toUpperCase()}{disconnectDialog?.slice(1)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke access and delete the stored credentials. You'll need to reconnect to use this integration again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => disconnectService(disconnectDialog!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Unplug className="h-4 w-4 mr-2" />
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};