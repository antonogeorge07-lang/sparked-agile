import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MessageSquare, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Settings,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OutlookConnectionWizard } from './OutlookConnectionWizard';
import { GoogleConnectionWizard } from './GoogleConnectionWizard';
import { formatDistanceToNow } from 'date-fns';

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface IntegrationStatus {
  type: string;
  isConnected: boolean;
  isValid: boolean;
  expiresSoon: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  userEmail?: string;
}

export const IntegrationStatusDashboard = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [showOutlookWizard, setShowOutlookWizard] = useState(false);
  const [showGoogleWizard, setShowGoogleWizard] = useState(false);

  const fetchIntegrationStatus = async () => {
    try {
      // Check Microsoft tokens (using safe view that excludes encrypted tokens)
      const { data: msTokens } = await supabase
        .from('user_microsoft_token_status')
        .select('is_valid, expires_at, user_email, updated_at')
        .maybeSingle();

      // Check Google tokens
      const { data: googleTokens } = await supabase
        .from('user_google_tokens')
        .select('id, expires_at, updated_at')
        .maybeSingle();

      // Check Slack tokens
      const { data: slackTokens } = await supabase
        .from('user_slack_tokens')
        .select('is_valid, team_name, updated_at')
        .maybeSingle();

      // Check GitHub tokens (if exists)
      const { data: githubTokens } = await supabase
        .from('user_github_tokens')
        .select('is_valid, github_username, updated_at')
        .maybeSingle();

      const statuses: IntegrationStatus[] = [];

      // Microsoft/Outlook
      if (msTokens) {
        const expiresAt = msTokens.expires_at ? new Date(msTokens.expires_at) : undefined;
        const expiresSoon = expiresAt ? expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;
        
        statuses.push({
          type: 'outlook',
          isConnected: true,
          isValid: msTokens.is_valid ?? false,
          expiresSoon,
          expiresAt,
          lastUsed: msTokens.updated_at ? new Date(msTokens.updated_at) : undefined,
          userEmail: msTokens.user_email ?? undefined
        });
      } else {
        statuses.push({
          type: 'outlook',
          isConnected: false,
          isValid: false,
          expiresSoon: false
        });
      }

      // Google
      if (googleTokens) {
        const expiresAt = googleTokens.expires_at ? new Date(googleTokens.expires_at) : undefined;
        const expiresSoon = expiresAt ? expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;
        
        statuses.push({
          type: 'google',
          isConnected: true,
          isValid: true, // If token exists, consider it valid
          expiresSoon,
          expiresAt,
          lastUsed: googleTokens.updated_at ? new Date(googleTokens.updated_at) : undefined,
        });
      } else {
        statuses.push({
          type: 'google',
          isConnected: false,
          isValid: false,
          expiresSoon: false
        });
      }

      // Slack
      if (slackTokens) {
        statuses.push({
          type: 'slack',
          isConnected: true,
          isValid: slackTokens.is_valid ?? false,
          expiresSoon: false,
          lastUsed: slackTokens.updated_at ? new Date(slackTokens.updated_at) : undefined,
          userEmail: slackTokens.team_name ?? undefined
        });
      } else {
        statuses.push({
          type: 'slack',
          isConnected: false,
          isValid: false,
          expiresSoon: false
        });
      }

      // GitHub
      if (githubTokens) {
        statuses.push({
          type: 'github',
          isConnected: true,
          isValid: githubTokens.is_valid ?? false,
          expiresSoon: false,
          lastUsed: githubTokens.updated_at ? new Date(githubTokens.updated_at) : undefined,
          userEmail: githubTokens.github_username ?? undefined
        });
      } else {
        statuses.push({
          type: 'github',
          isConnected: false,
          isValid: false,
          expiresSoon: false
        });
      }

      setIntegrations(statuses);
    } catch (error) {
      console.error('Error fetching integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const refreshToken = async (type: string) => {
    setRefreshing(type);
    try {
      const { error } = await supabase.functions.invoke('refresh-integration-token', {
        body: { integrationType: type }
      });

      if (error) throw error;

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} token refreshed`);
      await fetchIntegrationStatus();
    } catch (error: any) {
      toast.error(`Failed to refresh: ${error.message}`);
    } finally {
      setRefreshing(null);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'outlook': return Calendar;
      case 'google': return GoogleIcon;
      case 'slack': return MessageSquare;
      case 'github': return GitBranch;
      default: return Settings;
    }
  };

  const getIntegrationLabel = (type: string) => {
    switch (type) {
      case 'outlook': return 'Microsoft Outlook';
      case 'google': return 'Google Workspace';
      case 'slack': return 'Slack';
      case 'github': return 'GitHub';
      default: return type;
    }
  };

  const getIntegrationDescription = (type: string) => {
    switch (type) {
      case 'outlook': return 'Calendar & Teams';
      case 'google': return 'Calendar & Gmail';
      case 'slack': return 'Notifications';
      case 'github': return 'Repository sync';
      default: return '';
    }
  };

  const getStatusBadge = (integration: IntegrationStatus) => {
    if (!integration.isConnected) {
      return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" /> Not Connected</Badge>;
    }
    if (!integration.isValid) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Invalid</Badge>;
    }
    if (integration.expiresSoon) {
      return <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><AlertTriangle className="h-3 w-3" /> Expires Soon</Badge>;
    }
    return <Badge variant="default" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>;
  };

  const getHealthScore = () => {
    const connected = integrations.filter(i => i.isConnected && i.isValid).length;
    return Math.round((connected / Math.max(integrations.length, 1)) * 100);
  };

  const handleConnect = (type: string) => {
    if (type === 'outlook') {
      setShowOutlookWizard(true);
    } else if (type === 'google') {
      setShowGoogleWizard(true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Integration Status
              </CardTitle>
              <CardDescription>Monitor and manage your connected services</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Health</span>
              <div className="w-24">
                <Progress value={getHealthScore()} className="h-2" />
              </div>
              <span className="text-sm font-medium">{getHealthScore()}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => {
            const Icon = getIntegrationIcon(integration.type);
            const isGoogleIcon = integration.type === 'google';
            
            return (
              <div 
                key={integration.type}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    integration.isConnected && integration.isValid 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isGoogleIcon ? (
                      <GoogleIcon className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getIntegrationLabel(integration.type)}</span>
                      <span className="text-xs text-muted-foreground">
                        {getIntegrationDescription(integration.type)}
                      </span>
                      {getStatusBadge(integration)}
                    </div>
                    {integration.isConnected && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {integration.userEmail && (
                          <span>{integration.userEmail}</span>
                        )}
                        {integration.lastUsed && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated {formatDistanceToNow(integration.lastUsed, { addSuffix: true })}
                          </span>
                        )}
                        {integration.expiresSoon && integration.expiresAt && (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Expires {formatDistanceToNow(integration.expiresAt, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {integration.isConnected && (integration.type === 'outlook' || integration.type === 'google') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => refreshToken(integration.type)}
                      disabled={refreshing === integration.type}
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing === integration.type ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  
                  {!integration.isConnected && (integration.type === 'outlook' || integration.type === 'google') && (
                    <Button 
                      size="sm"
                      onClick={() => handleConnect(integration.type)}
                    >
                      Connect
                    </Button>
                  )}
                  
                  {integration.isConnected && !integration.isValid && (integration.type === 'outlook' || integration.type === 'google') && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnect(integration.type)}
                    >
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <OutlookConnectionWizard 
        isOpen={showOutlookWizard}
        onClose={() => setShowOutlookWizard(false)}
        onSuccess={() => {
          setShowOutlookWizard(false);
          fetchIntegrationStatus();
        }}
      />

      <GoogleConnectionWizard 
        isOpen={showGoogleWizard}
        onClose={() => setShowGoogleWizard(false)}
        onSuccess={() => {
          setShowGoogleWizard(false);
          fetchIntegrationStatus();
        }}
      />
    </>
  );
};
