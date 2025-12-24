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
import { formatDistanceToNow } from 'date-fns';

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

  const fetchIntegrationStatus = async () => {
    try {
      // Check Microsoft tokens
      const { data: msTokens } = await supabase
        .from('user_microsoft_tokens')
        .select('is_valid, expires_at, user_email, updated_at')
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
      case 'slack': return MessageSquare;
      case 'github': return GitBranch;
      default: return Settings;
    }
  };

  const getIntegrationLabel = (type: string) => {
    switch (type) {
      case 'outlook': return 'Microsoft Outlook';
      case 'slack': return 'Slack';
      case 'github': return 'GitHub';
      default: return type;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
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
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getIntegrationLabel(integration.type)}</span>
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
                  {integration.isConnected && integration.type === 'outlook' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => refreshToken(integration.type)}
                      disabled={refreshing === integration.type}
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing === integration.type ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  
                  {!integration.isConnected && integration.type === 'outlook' && (
                    <Button 
                      size="sm"
                      onClick={() => setShowOutlookWizard(true)}
                    >
                      Connect
                    </Button>
                  )}
                  
                  {integration.isConnected && !integration.isValid && integration.type === 'outlook' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setShowOutlookWizard(true)}
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
    </>
  );
};
