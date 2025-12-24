import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Calendar, Mail, Users, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OutlookConnectionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 'intro' | 'connecting' | 'permissions' | 'success' | 'error';

const MICROSOFT_SCOPES = [
  'https://graph.microsoft.com/Calendars.ReadWrite',
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/Group.ReadWrite.All',
  'https://graph.microsoft.com/Channel.Create',
  'offline_access'
];

export const OutlookConnectionWizard = ({ isOpen, onClose, onSuccess }: OutlookConnectionWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const steps = [
    { id: 'intro', label: 'Get Started', icon: Calendar },
    { id: 'connecting', label: 'Connect', icon: Mail },
    { id: 'permissions', label: 'Authorize', icon: Users },
    { id: 'success', label: 'Complete', icon: CheckCircle2 },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  useEffect(() => {
    if (currentStep === 'intro') setProgress(0);
    else if (currentStep === 'connecting') setProgress(33);
    else if (currentStep === 'permissions') setProgress(66);
    else if (currentStep === 'success') setProgress(100);
  }, [currentStep]);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state === 'outlook_connect') {
        setCurrentStep('permissions');
        
        try {
          const redirectUri = `${window.location.origin}/integrations`;
          
          const { data, error } = await supabase.functions.invoke('get-microsoft-token', {
            body: { code, redirectUri }
          });

          if (error) throw error;

          setUserEmail(data.userEmail);
          setCurrentStep('success');
          toast.success('Outlook connected successfully!');
          
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
          
          onSuccess?.();
        } catch (err: any) {
          console.error('OAuth callback error:', err);
          setError(err.message || 'Failed to connect Outlook');
          setCurrentStep('error');
        }
      }
    };

    handleCallback();
  }, [onSuccess]);

  const startConnection = async () => {
    setCurrentStep('connecting');
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-microsoft-client-id');
      
      if (error) throw error;
      if (!data?.clientId) throw new Error('Microsoft integration not configured');

      const redirectUri = `${window.location.origin}/integrations`;
      const scope = MICROSOFT_SCOPES.join(' ');
      
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.set('client_id', data.clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('state', 'outlook_connect');
      authUrl.searchParams.set('prompt', 'consent');

      // Redirect to Microsoft login
      window.location.href = authUrl.toString();
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to start connection');
      setCurrentStep('error');
    }
  };

  const handleClose = () => {
    setCurrentStep('intro');
    setError(null);
    setUserEmail(null);
    onClose();
  };

  const permissions = [
    { icon: Calendar, label: 'Create & manage calendar events', description: 'Schedule ceremonies and meetings' },
    { icon: Mail, label: 'Read your profile', description: 'Get your email and display name' },
    { icon: Users, label: 'Manage team channels', description: 'Create Teams channels for projects' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Connect Outlook Calendar
          </DialogTitle>
          <DialogDescription>
            Sync your ceremonies and meetings with Microsoft Outlook
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === stepIndex;
              const isComplete = index < stepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div className={`rounded-full p-1.5 ${
                    isComplete ? 'bg-primary text-primary-foreground' :
                    isActive ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[200px] flex flex-col">
          {currentStep === 'intro' && (
            <div className="space-y-4 flex-1">
              <div className="space-y-3">
                <h3 className="font-medium">What you'll get:</h3>
                {permissions.map((perm, i) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="p-3 flex items-start gap-3">
                      <perm.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{perm.label}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button onClick={startConnection} className="w-full gap-2">
                Connect with Microsoft
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 'connecting' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-medium">Connecting to Microsoft...</p>
                <p className="text-sm text-muted-foreground">You'll be redirected to sign in</p>
              </div>
            </div>
          )}

          {currentStep === 'permissions' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-medium">Setting up your connection...</p>
                <p className="text-sm text-muted-foreground">Storing tokens securely</p>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">Successfully Connected!</p>
                {userEmail && (
                  <Badge variant="secondary" className="mt-2">{userEmail}</Badge>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Your Outlook calendar is now synced
                </p>
              </div>
              <Button onClick={handleClose} className="mt-4">
                Done
              </Button>
            </div>
          )}

          {currentStep === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">Connection Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setCurrentStep('intro')} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
